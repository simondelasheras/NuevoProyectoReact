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

export function rememberPendingCart(items, emailSent) {
  const current = readPendingCart();
  const byId = new Map();
  const source = [...(current ? current.items : []), ...(items || [])];
  source.forEach((item) => {
    if (item && item._id) byId.set(String(item._id), { _id: item._id });
  });
  const next = {
    emailSent: Boolean(emailSent || (current && current.emailSent)),
    items: [...byId.values()],
  };
  writePending(next.items.length ? next : null);
  return next;
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
  for (const item of pending.items) {
    const product = products.find((entry) => entry._id === item._id);
    try {
      if (product) await restoreProduct(product);
      await deleteCartItem(item._id);
    } catch (error) {
      console.error("Error updating cart after purchase:", error);
      stillPending.push({ _id: item._id });
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
