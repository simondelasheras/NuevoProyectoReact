// store.js
import axios from "axios";
import { createContext, useReducer, useEffect } from "react";

export const Store = createContext();

const initialState = {
  products: [],
  cart: {
    cartItems: [],
  },
};

// Función para obtener datos y actualizar el estado
const getData = async (dispatch) => {
  try {
    const resProducts = await axios("http://localhost:5000/products");
    const resCart = await axios("http://localhost:5000/cart");

    const newProducts = resProducts.data;
    const newCartItem = resCart.data;


    const cartItems = (newCartItem && newCartItem.cartItems) || [];

    dispatch({
      type: "READ_STATE",
      payload: {
        products: newProducts,
        cart: { cartItems },
      },
    });
  } catch (error) {
    console.error("Error updating state:", error);
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "READ_STATE": {
      const cartItems =
        (action.payload.cart && action.payload.cart.cartItems) || [];

      return {
        ...state,
        products: action.payload.products,
        cart: { cartItems },
      };
    }
case "CART_ADD_ITEM": {
  const { id, quantity } = action.payload;
  const productToAdd = state.products.find((product) => product.id === id);

  if (!productToAdd) {
    console.error("Product not found:", id);
    return state;
  }

  const existingCart = state.cart || {};
  const existingCartItems = existingCart.cartItems || [];

  const existingItemIndex = existingCartItems.findIndex(
    (item) => item.id === id
  );

  const updatedCartItems = [...existingCartItems];

  if (existingItemIndex !== -1) {
    updatedCartItems[existingItemIndex].inCart += quantity;
  } else {
    updatedCartItems.push({ ...productToAdd, inCart: quantity });
  }

  // Actualiza el stock en el carrito y en products
  const updatedProducts = state.products.map((product) =>
    product.id === id
      ? {
          ...product,
          countInStock: Math.max(product.countInStock - quantity, 0),
          inCart: product.inCart + quantity,
        }
      : product
  );

  // Actualiza el stock en el endpoint "cart"
  const updatedCart = {
    ...existingCart,
    cartItems: updatedCartItems,
  };

  // Agrega las actualizaciones al estado
  return {
    ...state,
    products: updatedProducts,
    cart: updatedCart,
  };
}v

    case "CART_REMOVE_ITEM": {
      const cartItems = state.cart.cartItems.filter(
        (item) => item.id !== action.payload.id
      );

      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CART_REMOVE_ONE_ITEM": {
      const cartItems = state.cart.cartItems
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);

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
    getData(dispatch);
  }, []);

  const contextValue = { state, dispatch };

  return <Store.Provider value={contextValue}>{children}</Store.Provider>;
}
