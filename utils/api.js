function origin(value, fallback) {
  return String(value || fallback).replace(/\/+$/, "");
}

export const productsUrl = `${origin(
  process.env.NEXT_PUBLIC_PRODUCTS_URL,
  "http://localhost:5050"
)}/api/products`;

export const cartsUrl = `${origin(
  process.env.NEXT_PUBLIC_CARTS_URL,
  "http://localhost:8080"
)}/api/carts`;

export const buyUrl = `${origin(
  process.env.NEXT_PUBLIC_BUY_URL,
  "http://localhost:9090"
)}/api/buy`;
