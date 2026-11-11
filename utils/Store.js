
import axios from "axios";
import { createContext, useReducer, useEffect } from "react";
import { clearPurchaseAttempt, resumeOpenPurchase } from "./purchaseAttempt";
import { readPendingCart, settlePendingCart } from "./settleCart";

export const Store = createContext();

const initialState = {
  products: [],
  cart: null,
  cartStatus: "loading",
  settleStatus: null,
};

export const CART_LOAD_TIMEOUT_MS = 8000;

// Un reintento puede convivir con el timeout anterior. Solo aplica la última respuesta.
let latestCartRequest = 0;

export const getData = async (dispatch) => {
  const requestId = ++latestCartRequest;
  const isCurrent = () => requestId === latestCartRequest;

  dispatch({ type: "CART_LOAD_START" });

  const productsPromise = axios
    .get("http://localhost:5050/api/products", { timeout: CART_LOAD_TIMEOUT_MS })
    .then((res) => {
      if (!isCurrent() || !Array.isArray(res.data)) {
        return null;
      }
      dispatch({ type: "PRODUCTS_LOADED", payload: res.data });
      return res.data;
    })
    .catch((error) => {
      console.error("Error updating state:", error);
      return null;
    });

  const cartPromise = axios
    .get("http://localhost:8080/api/carts", { timeout: CART_LOAD_TIMEOUT_MS })
    .then((res) => (Array.isArray(res.data) ? res.data : []))
    .catch((error) => {
      console.error("Error updating state:", error);
      return null;
    });

  const [products, cartItems] = await Promise.all([productsPromise, cartPromise]);

  if (!isCurrent()) {
    return;
  }

  if (cartItems) {
    dispatch({
      type: "READ_STATE",
      payload: {
        products: products === null ? undefined : products,
        cart: cartItems,
      },
    });
    return;
  }

  dispatch({ type: "CART_LOAD_ERROR" });
};

function reducer(state, action) {
  switch (action.type) {
    case "SETTLE_FAILED": {
      return { ...state, settleStatus: "error" };
    }
    case "SETTLE_OK": {
      return { ...state, settleStatus: null };
    }
    case "CART_LOAD_START": {
      return { ...state, cartStatus: "loading" };
    }
    case "CART_LOAD_ERROR": {
      return { ...state, cartStatus: "error" };
    }
    case "PRODUCTS_LOADED": {
      if (!Array.isArray(action.payload)) {
        return state;
      }
      return { ...state, products: action.payload };
    }
    case "READ_STATE": {
      const cartItems = Array.isArray(action.payload.cart) ? action.payload.cart : [];
      const products = Array.isArray(action.payload.products)
        ? action.payload.products
        : state.products;

      return {
        ...state,
        products,
        cart: { cartItems },
        cartStatus: "ready",
      };
    }
    // case "CART_ADD_ITEM": {
    //   const { id, quantity } = action.payload;

    //   // Verifica si state.cart está definido y tiene la propiedad cartItems
    //   if (!state.cart || !state.cart.cartItems) {
    //     console.error("Cart not found or not in the expected format");
    //     return state;
    //   }

    //   const productToAdd = state.products.find((product) => product.id === id);

    //   if (!productToAdd) {
    //     console.error("Product not found:", id);
    //     return state;
    //   }

    //   const existingCart = state.cart || {};
    //   const existingCartItems = existingCart.cartItems || [];

    //   const existingItemIndex = existingCartItems.findIndex(
    //     (item) => item.id === id
    //   );

    //   const updatedCartItems = [...existingCartItems];

    //   if (existingItemIndex !== -1) {
    //     updatedCartItems[existingItemIndex].inCart += quantity;
    //   } else {
    //     updatedCartItems.push({ ...productToAdd, inCart: quantity });
    //   }

    //   // Actualiza el array cartItems en el estado del carrito
    //   const updatedCart = {
    //     ...existingCart,
    //     cartItems: updatedCartItems,
    //   };

    //   // Agrega las actualizaciones al estado
    //   return {
    //     ...state,
    //     cart: updatedCart,
    //   };
    // }

    case "CART_REMOVE_ITEM": {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );

      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CART_REMOVE_ONE_ITEM": {

      const cartItems = state.cart.cartItems
        .map((item) =>
          item._id === action.payload._id
            ? { ...item, inCart: item.inCart - 1 }
            : item
        )
        .filter((item) => item.inCart > 0);

      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CART_CLEAR": {
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    }

    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let active = true;

    (async () => {
      await resumeOpenPurchase();
      if (readPendingCart()) {
        const result = await settlePendingCart();
        if (result.ok && result.emailSent) clearPurchaseAttempt();
        if (active && !result.ok) {
          dispatch({ type: "SETTLE_FAILED" });
        }
      }
      if (active) await getData(dispatch);
    })();

    return () => {
      active = false;
    };
  }, []);

  const contextValue = { state, dispatch };

  return <Store.Provider value={contextValue}>{children}</Store.Provider>;
}
