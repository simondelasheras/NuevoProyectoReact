// OffcanvasContent.js
import { useContext, useEffect } from "react";
import { Store } from "../utils/Store";
import styles from "../styles/OffCanvasContent.module.css";
import axios from "axios";

const OffcanvasContent = ({ offcanvasInstance }) => {
  const { state, dispatch } = useContext(Store);
  const { cart, products } = state;

  const removeFromCartHandler = async (id) => {
    try {
      // Realiza una solicitud DELETE para eliminar el producto del carrito
      await axios.delete(`http://localhost:5000/cart/${id}`);

      // Despacha una acción para actualizar el estado del carrito
      dispatch({ type: "CART_REMOVE_ITEM", payload: { id } });

      // Obtén el producto correspondiente al id
      const product = state.products.find((p) => p.id === id);

      // Incrementa el stock en la base de datos
      await axios.patch(`http://localhost:5000/products/${id}`, {
        inStock: product.inStock + 1,
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const removeOneFromCartHandler = async (id) => {
    try {
      // Realiza una solicitud PATCH para eliminar una unidad del producto del carrito
      await axios.patch(`http://localhost:5000/cart/${id}`);

      // Despacha una acción para actualizar el estado del carrito
      dispatch({ type: "CART_REMOVE_ONE_ITEM", payload: { id } });

      // Obtén el producto correspondiente al id
      const product = state.products.find((p) => p.id === id);

      // Incrementa el stock en la base de datos
      await axios.patch(`http://localhost:5000/products/${id}`, {
        inStock: product.inStock + 1,
      });
    } catch (error) {
      console.error("Error removing one from cart:", error);
    }
  };

  const clearCartHandler = async () => {
    try {
      // Realiza una solicitud DELETE para limpiar el carrito
      await axios.delete("http://localhost:5000/cart");

      // Despacha una acción para limpiar el estado del carrito
      dispatch({ type: "CART_CLEAR" });
    } catch (error) {
      console.error("Error clearing cart:", error);
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
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
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
          <div>Cart is empty.</div>
        )}
        {cart && cart.cartItems && cart.cartItems.length > 0 && (
          <div className={styles["cart-total"]}>
            <div className={styles["cart-total-label"]}>Total:</div>
            <div className={styles["cart-total-amount"]}>
              ${cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
            </div>
          </div>
        )}
        {cart && cart.cartItems && cart.cartItems.length > 0 && (
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
