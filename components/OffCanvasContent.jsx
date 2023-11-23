// OffcanvasContent.js

import { useContext } from "react";
import { Store } from "../utils/Store";
import styles from "../styles/OffCanvasContent.module.css";

const OffcanvasContent = ({ offcanvasInstance }) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const removeFromCartHandler = (item) => {
    dispatch({ type: "CART_REMOVE_ITEM", payload: item });
  };

  const removeOneFromCartHandler = (item) => {
    dispatch({ type: "CART_REMOVE_ONE_ITEM", payload: item });
  };

  const clearCartHandler = () => {
    dispatch({ type: "CART_CLEAR" });
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
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className={`offcanvas-body ${styles["cart-content"]}`}>
        <h6 className={styles["cart-content-title"]}>In Cart:</h6>
        {cart.cartItems.length === 0 ? (
          <div>Cart is empty.</div>
        ) : (
          <ul className={styles["cart-items-list"]}>
            {cart.cartItems.map((item) => (
              <li key={item.slug} className={styles["cart-item"]}>
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
                      Quantity: {item.quantity}
                    </div>
                    <div className={styles["cart-item-price"]}>
                      Price: ${item.price}
                    </div>
                    <div className={styles["cart-item-subtotal"]}>
                      Subtotal: ${item.quantity * item.price}
                    </div>
                    <div className={styles["cart-item-actions"]}>
                      <button
                        className={`btn btn-outline-primary ${styles["btn-remove-one"]}`}
                        onClick={() => removeOneFromCartHandler(item)}
                      >
                        Remove One
                      </button>
                      <button
                        className={`btn btn-outline-primary ${styles["btn-remove-all"]}`}
                        onClick={() => removeFromCartHandler(item)}
                      >
                        Remove All
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {cart.cartItems.length > 0 && (
          <div className={styles["cart-total"]}>
            <div className={styles["cart-total-label"]}>Total:</div>
            <div className={styles["cart-total-amount"]}>
              ${cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
            </div>
          </div>
        )}
        {cart.cartItems.length > 0 && (
          <button
            className={`btn btn-primary ${styles["btn-clear-cart"]}`}
            onClick={clearCartHandler}
          >
            Clear Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default OffcanvasContent;
