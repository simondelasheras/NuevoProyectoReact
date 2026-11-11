import axios from "axios";

const PENDING_KEY = "powersport-pending-cart";
const TIMEOUT_MS = 8000;

function storage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readPendingCart() {
  const localStorage = storage();
  if (!localStorage) return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_KEY) || "null");
    if (!parsed || !Array.isArray(parsed.items)) return null;
    const items = parsed.items.filter((item) => item && item._id);
    if (items.length === 0) return null;
    return { emailSent: Boolean(parsed.emailSent), items };
  } catch (error) {
    console.error("Error reading pending cart:", error);
    return null;
  }
}

function writePending(pending) {
  const localStorage = storage();
  if (!localStorage) return;
  if (!pending || !pending.items || pending.items.length === 0) {
    localStorage.removeItem(PENDING_KEY);
    return;
  }
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

function asOperation(item) {
  if (!item || !item._id) return null;
  if (item.mode === "units") {
    if (item.targetCountInStock != null) {
      return {
        _id: item._id,
        mode: "units",
        targetCountInStock: Number(item.targetCountInStock),
        targetProductInCart: Number(item.targetProductInCart),
        targetCartInCart: Number(item.targetCartInCart),
      };
    }
    return { _id: item._id, mode: "units", units: Number(item.units) || 1 };
  }
  return { _id: item._id, mode: "all" };
}

function mergeOperation(current, incoming) {
  if (!current) return incoming;
  if (current.mode === "all" || incoming.mode === "all") {
    return { _id: incoming._id, mode: "all" };
  }
  if (current.targetCountInStock != null && incoming.targetCountInStock == null) {
    return current;
  }
  return incoming;
}

export function rememberPendingCart(items, emailSent) {
  const current = readPendingCart();
  const byId = new Map();
  (current ? current.items : []).forEach((item) => {
    const operation = asOperation(item);
    if (operation) byId.set(String(operation._id), operation);
  });
  (items || []).forEach((item) => {
    const operation = asOperation(item);
    if (!operation) return;
    const previous = byId.get(String(operation._id));
    byId.set(String(operation._id), mergeOperation(previous, operation));
  });
  const next = {
    emailSent: Boolean(emailSent || (current && current.emailSent)),
    items: [...byId.values()],
  };
  writePending(next.items.length ? next : null);
  return next;
}

export async function queueRelease(id, units) {
  let product = null;
  let line = null;
  let loaded = false;

  try {
    const [productsResponse, cartsResponse] = await Promise.all([
      axios.get("http://localhost:5050/api/products", { timeout: TIMEOUT_MS }),
      axios.get("http://localhost:8080/api/carts", { timeout: TIMEOUT_MS }),
    ]);
    if (!Array.isArray(productsResponse.data) || !Array.isArray(cartsResponse.data)) {
      throw new Error("unexpected catalog");
    }
    product = productsResponse.data.find((entry) => entry._id === id) || null;
    line = cartsResponse.data.find((entry) => entry._id === id) || null;
    loaded = true;
  } catch (error) {
    console.error("Error preparing cart update:", error);
  }

  if (!loaded) {
    rememberPendingCart(
      [
        units === "all"
          ? { _id: id, mode: "all" }
          : { _id: id, mode: "units", units: Number(units) || 1 },
      ],
      false
    );
    return;
  }

  if (!product && !line) return;

  const productQty = Number(product && product.inCart) || 0;
  const lineQty = Number(line && line.inCart) || 0;
  const stock = Number(product && product.countInStock) || 0;
  const releaseAll =
    units === "all" || (Number(units) || 0) >= Math.max(productQty, lineQty, 1);

  if (releaseAll || !product) {
    rememberPendingCart([{ _id: id, mode: "all" }], false);
    return;
  }

  const release = Number(units) || 1;
  rememberPendingCart(
    [
      {
        _id: id,
        mode: "units",
        targetCountInStock: stock + release,
        targetProductInCart: Math.max(0, productQty - release),
        targetCartInCart: Math.max(0, lineQty - release),
      },
    ],
    false
  );
}

function isAlreadyGone(error) {
  return Boolean(error && error.response && error.response.status === 404);
}

// Suma solo el inCart que el producto todavía tiene. Si un reintento
// llega con inCart en 0, no vuelve a sumar stock.
async function restoreProduct(product) {
  const allocated = Number(product.inCart) || 0;
  if (allocated <= 0) return;
  await axios.patch(
    `http://localhost:5050/api/products/${product._id}`,
    {
      countInStock: (Number(product.countInStock) || 0) + allocated,
      inCart: 0,
    },
    { timeout: TIMEOUT_MS }
  );
}

async function deleteCartItem(id) {
  try {
    await axios.delete(`http://localhost:8080/api/carts/${id}`, {
      timeout: TIMEOUT_MS,
    });
  } catch (error) {
    if (!isAlreadyGone(error)) throw error;
  }
}

async function resolveUnits(item, products) {
  const response = await axios.get("http://localhost:8080/api/carts", {
    timeout: TIMEOUT_MS,
  });
  const carts = Array.isArray(response.data) ? response.data : [];
  const product = products.find((entry) => entry._id === item._id);
  const line = carts.find((entry) => entry._id === item._id);
  const productQty = Number(product && product.inCart) || 0;
  const lineQty = Number(line && line.inCart) || 0;
  const stock = Number(product && product.countInStock) || 0;
  const release = Number(item.units) || 1;

  if (!product || release >= Math.max(productQty, lineQty)) {
    return { _id: item._id, mode: "all" };
  }

  return {
    _id: item._id,
    mode: "units",
    targetCountInStock: stock + release,
    targetProductInCart: Math.max(0, productQty - release),
    targetCartInCart: Math.max(0, lineQty - release),
  };
}

async function applyUnits(item) {
  await axios.patch(
    `http://localhost:5050/api/products/${item._id}`,
    {
      countInStock: item.targetCountInStock,
      inCart: item.targetProductInCart,
    },
    { timeout: TIMEOUT_MS }
  );

  if (item.targetCartInCart <= 0) {
    await deleteCartItem(item._id);
    return;
  }

  try {
    await axios.patch(
      `http://localhost:8080/api/carts/${item._id}`,
      {
        countInStock: item.targetCountInStock,
        inCart: item.targetCartInCart,
      },
      { timeout: TIMEOUT_MS }
    );
  } catch (error) {
    if (!isAlreadyGone(error)) throw error;
  }
}

let inFlight = null;

async function settleNow() {
  const pending = readPendingCart();
  if (!pending) return { ok: true, emailSent: false };

  let products;
  try {
    const response = await axios.get("http://localhost:5050/api/products", {
      timeout: TIMEOUT_MS,
    });
    if (!Array.isArray(response.data)) {
      return { ok: false, emailSent: pending.emailSent };
    }
    products = response.data;
  } catch (error) {
    console.error("Error updating cart after purchase:", error);
    return { ok: false, emailSent: pending.emailSent };
  }

  const stillPending = [];
  const operations = pending.items.map((item) => asOperation(item)).filter(Boolean);

  for (let index = 0; index < operations.length; index += 1) {
    let item = operations[index];
    try {
      if (item.mode === "units" && item.targetCountInStock == null) {
        item = await resolveUnits(item, products);
        operations[index] = item;
        writePending({ emailSent: pending.emailSent, items: operations });
      }

      if (item.mode === "units") {
        await applyUnits(item);
      } else {
        const product = products.find((entry) => entry._id === item._id);
        if (product) await restoreProduct(product);
        await deleteCartItem(item._id);
      }
    } catch (error) {
      console.error("Error updating cart after purchase:", error);
      stillPending.push(item);
    }
  }

  if (stillPending.length > 0) {
    writePending({ emailSent: pending.emailSent, items: stillPending });
    return { ok: false, emailSent: pending.emailSent };
  }

  writePending(null);
  return { ok: true, emailSent: pending.emailSent };
}

export function settlePendingCart() {
  if (!inFlight) {
    inFlight = settleNow().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
