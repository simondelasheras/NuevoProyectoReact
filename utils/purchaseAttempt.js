import axios from "axios";
import { readPendingCart, rememberPendingCart } from "./settleCart";

const STORAGE_KEY = "powersport-purchase-id";
const BUY_URL = "http://localhost:9090/api/buy";
const REQUEST_TIMEOUT_MS = 60000;

function storage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readPurchaseAttempt() {
  const localStorage = storage();
  if (!localStorage) return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed || typeof parsed.purchaseId !== "string") return null;
    if (!Array.isArray(parsed.products) || parsed.products.length === 0) return null;
    if (typeof parsed.email !== "string" || !parsed.email) return null;
    return parsed;
  } catch (error) {
    console.error("Error reading purchase attempt:", error);
    return null;
  }
}

export function savePurchaseAttempt(attempt) {
  const localStorage = storage();
  if (!localStorage) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempt));
}

export function clearPurchaseAttempt() {
  const localStorage = storage();
  if (!localStorage) return;
  localStorage.removeItem(STORAGE_KEY);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function messageForStatus(status) {
  if (status === 500) {
    return "We couldn't send the confirmation email. Your cart was not changed.";
  }
  if (status === 503) {
    return "Purchase email isn't available right now. Your cart was not changed.";
  }
  if (status === 409) {
    return "Your purchase is still processing. Please try again.";
  }
  return "We couldn't complete the purchase. Please try again.";
}

async function postOnce(attempt) {
  try {
    await axios.post(
      BUY_URL,
      {
        email: attempt.email,
        products: attempt.products,
        purchaseId: attempt.purchaseId,
      },
      { timeout: REQUEST_TIMEOUT_MS }
    );
    return { ok: true, status: 200 };
  } catch (error) {
    const status = error.response ? error.response.status : 0;
    return { ok: false, status };
  }
}

let inFlight = null;

async function sendWithRetries(attempt) {
  for (let round = 0; round < 2; round += 1) {
    const result = await postOnce(attempt);
    if (result.ok || result.status !== 409) return result;
    await sleep(2000);
  }
  return { ok: false, status: 409 };
}

export function submitPurchase(attempt) {
  if (!inFlight) {
    inFlight = sendWithRetries(attempt).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

// El id queda atado al email y a los productos de este confirm.
// Si el carrito o el email cambian antes de un 200, el reintento sigue
// con ese mismo id y con esa copia: el backend, si ya guardó la respuesta,
// la repite aunque el cuerpo nuevo sea distinto.
export function beginPurchase(email, products) {
  const existing = readPurchaseAttempt();
  if (existing) return existing;
  const attempt = {
    purchaseId: crypto.randomUUID(),
    email,
    products,
  };
  savePurchaseAttempt(attempt);
  return attempt;
}

export async function resumeOpenPurchase() {
  const pending = readPendingCart();
  if (pending && pending.emailSent) return { ok: true, skipped: true };
  const attempt = readPurchaseAttempt();
  if (!attempt) return { ok: true, skipped: true };

  const result = await submitPurchase(attempt);
  if (!result.ok) return { ...result, skipped: false, products: attempt.products };
  rememberPendingCart(attempt.products, true);
  return { ok: true, skipped: false, products: attempt.products };
}

export { messageForStatus };
