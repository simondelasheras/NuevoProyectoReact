
import { useContext, useEffect } from "react";
import { Store } from "../utils/Store";
import styles from "../styles/OffCanvasContent.module.css";
import axios from "axios";

const getData = async (dispatch) => {
  try {
    const res = await axios.get("http://localhost:5000/products");
    const res2 = await axios.get("http://localhost:5001/cart");
    
    dispatch({
      type: "READ_STATE",
      payload: {
        products: res.data,
        cart: res2.data,
      },
    });
  } catch (error) {
    console.error("Error getting data:", error);
  }
};

const OffcanvasContent = ({ offcanvasInstance }) => {
  const { state, dispatch } = useContext(Store);
  const { cart, products } = state;

  const removeFromCartHandler = async (id) => {
    try {
      
      await axios.delete(`http://localhost:5001/cart/${id}`);

      
      dispatch({ type: "CART_REMOVE_ITEM", payload: { id } });

      
      const product = state.products.find((p) => p.id === id);

      
      await axios.patch(`http://localhost:5000/products/${id}`, {
        countInStock: product.countInStock + product.inCart,
        inCart: 0
      });
      getData(dispatch);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

const removeOneFromCartHandler = async (id) => {
  try {
    const product = state.products.find((p) => p.id === id);

    if (product.inCart > 1) {
      await axios.patch(`http://localhost:5001/cart/${id}`, {
        countInStock: product.countInStock + 1,
        inCart: product.inCart - 1,
      });

      dispatch({ type: "CART_REMOVE_ONE_ITEM", payload: { id } });

      await axios.patch(`http://localhost:5000/products/${id}`, {
        countInStock: product.countInStock + 1,
        inCart: product.inCart - 1,
      });

      
      getData(dispatch);
    } else {
      await axios.delete(`http://localhost:5001/cart/${id}`);
      dispatch({ type: "CART_REMOVE_ITEM", payload: { id } });
      await axios.patch(`http://localhost:5000/products/${id}`, {
        countInStock: product.countInStock + 1,
        inCart: 0,
      });

      
      getData(dispatch);
    }
  } catch (error) {
    console.error("Error removing one from cart:", error);
  }
};


const clearCartHandler = async () => {
  try {
    
    const cartItemIds = state.cart.cartItems.map((item) => item.id);

    
    for (const id of cartItemIds) {
      try {
        await axios.delete(`http://localhost:5001/cart/${id}`);
      } catch (error) {
        console.error(`Error deleting item with ID ${id}:`, error);
      }
    }

    
    dispatch({ type: "CART_CLEAR" });

    
    for (const item of state.cart.cartItems) {
      try {
        const product = state.products.find((p) => p.id === item.id);
        await axios.patch(`http://localhost:5000/products/${item.id}`, {
          countInStock: product.countInStock + item.inCart,
          inCart: 0,
        });
      } catch (error) {
        console.error(
          `Error updating stock for item with ID ${item.id}:`,
          error
        );
      }
    }

   
    await new Promise((resolve) => setTimeout(resolve, 1000));

    
    getData(dispatch);
  } catch (error) {
    console.error("Error removing from cart:", error);
  }
};




  return (
    <div
      className={`offcanvas offcanvas-end`}
      tabIndex="-1"
      id="offcanvasRight"
      aria-labelledby="offcanvasRightLabel"
    >
      <div className={`offcanvas-header ${styles["offcanvas-header"]}`}>
        <h5
          className={`offcanvas-title ${styles["shopping-cart-title"]}`}
          id="offcanvasRightLabel"
        >
          Shopping Cart
        </h5>
        <button
          type="button"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
          className={styles.newButton}
        ></button>
      </div>
      <div className={`offcanvas-body ${styles["cart-content"]}`}>
        <h6 className={styles["cart-content-title"]}>In Cart:</h6>
        {cart && cart.cartItems && cart.cartItems.length > 0 ? (
          <ul className={styles["cart-items-list"]}>
            {cart.cartItems.map((item) => (
              <li key={item.id} className={styles["cart-item"]}>
                <div className={styles["cart-item-details"]}>
                  <div className={styles["cart-item-image-container"]}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles["cart-item-image"]}
                    />
                  </div>
                  <div className={styles["cart-item-info"]}>
                    <div className={styles["cart-item-name"]}>{item.name}</div>
                    <div className={styles["cart-item-quantity"]}>
                      Quantity: {item.inCart}
                    </div>
                    <div className={styles["cart-item-price"]}>
                      Price: ${item.price}
                    </div>
                    <div className={styles["cart-item-subtotal"]}>
                      Subtotal: ${item.inCart * item.price}
                    </div>
                    <div className={styles["cart-item-actions"]}>
                      <button
                        className={`btn btn-outline-primary ${styles["btn-remove-one"]}`}
                        onClick={() => removeOneFromCartHandler(item.id)}
                      >
                        Remove One
                      </button>
                      <button
                        className={`btn btn-outline-primary ${styles["btn-remove-all"]}`}
                        onClick={() => removeFromCartHandler(item.id)}
                      >
                        Remove All
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.cartEmptyMessage}>Cart is empty.</div>
        )}
        {cart && cart.cartItems && cart.cartItems.length > 0 && (
          <div className={styles["cart-total"]}>
            <div className={styles["cart-total-label"]}>Total:</div>
            <div className={styles["cart-total-amount"]}>
              ${cart.cartItems.reduce((a, c) => a + c.inCart * c.price, 0)}
            </div>
          </div>
        )}
        {cart && cart.cartItems && cart.cartItems.length > 0 && (
          <button
            className={`btn btn-primary ${styles["btn-clear-cart"]}`}
            onClick={() => {
              console.log("Botón Clear Cart presionado");
              clearCartHandler();
            }}
          >
            Clear Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default OffcanvasContent;
