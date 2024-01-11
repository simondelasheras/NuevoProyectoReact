
import axios from "axios";
import { createContext, useReducer, useEffect } from "react";

export const Store = createContext();

const initialState = {
  products: [],
  cart:  []
};


const getData = async (dispatch) => {
  try {
    
    const resProducts = await axios("http://localhost:5000/products");
    

    
    const resCart = await axios("http://localhost:5001/cart");
    

    const newProducts = resProducts.data;
    const newCartItem = resCart.data;

    const cartItems = (newCartItem) || [];
    

    dispatch({
      type: "READ_STATE",
      payload: {
        products: newProducts,
        cart: 0,
      },
    });

    console.log("State updated successfully!");
  } catch (error) {
    console.error("Error updating state:", error);
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "READ_STATE": {
      const cartItems = action.payload.cart || [];

      return {
        ...state,
        products: action.payload.products,
        cart: { cartItems },
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
        (item) => item.id !== action.payload.id
      );

      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CART_REMOVE_ONE_ITEM": {

      const cartItems = state.cart.cartItems
        .map((item) =>
          item.id === action.payload.id
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
    getData(dispatch);
  }, []);

  const contextValue = { state, dispatch };

  return <Store.Provider value={contextValue}>{children}</Store.Provider>;
}
