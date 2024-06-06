
import { useState, useContext, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { Store } from "../utils/Store";
import styles from "../styles/OffCanvasContent.module.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const getData = async (dispatch) => {
  try {
    const res = await axios.get("http://localhost:5050/api/products");
    const res2 = await axios.get("http://localhost:8080/api/carts");
    
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
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [offcanvasOpen, setOffcanvasOpen] = useState(true); // Cambiado a false para que el offcanvas esté cerrado por defecto

  const emailInputRef = useRef(null);

  useEffect(() => {
    // Establecer el foco en el input del email cuando se abre el modal
    if (showModal) {
      emailInputRef.current.focus();
    }
  }, [showModal]);

  
  const handleBuyClick = () => {
    setShowModal(true);
    setOffcanvasOpen(false); // Cerrar el offcanvas al abrir el modal de compra
  };

  const handleClose = () => {
    setShowModal(false);
    setEmail("");
    setError("");
    setOffcanvasOpen(false); // Mantener el offcanvas cerrado al cerrar el modal de compra
  };

const handlePurchase = async () => {
  if (!email) {
    console.log("Email is required");
    setError("Email is required");
    return;
  }

  try {
    console.log("Sending purchase request...");
    await axios.post("http://localhost:9090/api/buy", {
      email,
      products: cart.cartItems,
    });
    console.log("Purchase request successful!");
    clearCartHandler();
    handleClose();
  } catch (error) {
    console.error("Error processing purchase:", error);
    setError("Error processing purchase");
  }
};

  const removeFromCartHandler = async (_id) => {
    try {
      console.log(`Removing item with id: ${_id}`);
      await axios.delete(`http://localhost:8080/api/carts/${_id}`);

      dispatch({ type: "CART_REMOVE_ITEM", payload: { _id } });

      const product = state.products.find((p) => p._id === _id);

      if (!product) {
        console.error(`Product with id ${_id} not found`);
        return;
      }

      console.log("Product details:", product);

      await axios.patch(`http://localhost:5050/api/products/${_id}`, {
        countInStock: product.countInStock + product.inCart,
        inCart: 0,
      });
      getData(dispatch);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const removeOneFromCartHandler = async (_id) => {
    try {
      const product = state.products.find((p) => p._id === _id);

      if (!product) {
        console.error(`Product with id ${_id} not found`);
        return;
      }

      console.log("Removing one item with id:", _id);
      console.log("Product details:", product);

      if (product.inCart > 1) {
        await axios.patch(`http://localhost:8080/api/carts/${_id}`, {
          countInStock: product.countInStock + 1,
          inCart: product.inCart - 1,
        });

        dispatch({ type: "CART_REMOVE_ONE_ITEM", payload: { _id } });

        await axios.patch(`http://localhost:5050/api/products/${_id}`, {
          countInStock: product.countInStock + 1,
          inCart: product.inCart - 1,
        });

        getData(dispatch);
      } else {
        await axios.delete(`http://localhost:8080/api/carts/${_id}`);
        dispatch({ type: "CART_REMOVE_ITEM", payload: { _id } });
        await axios.patch(`http://localhost:5050/api/products/${_id}`, {
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
      const cartItemIds = state.cart.cartItems.map((item) => item._id);

      for (const _id of cartItemIds) {
        try {
          await axios.delete(`http://localhost:8080/api/carts/${_id}`);
        } catch (error) {
          console.error(`Error deleting item with ID ${_id}:`, error);
        }
      }

      dispatch({ type: "CART_CLEAR" });

      for (const item of state.cart.cartItems) {
        try {
          const product = state.products.find((p) => p._id === item._id);
          await axios.patch(`http://localhost:5050/api/products/${item._id}`, {
            countInStock: product.countInStock + item.inCart,
            inCart: 0,
          });
        } catch (error) {
          console.error(
            `Error updating stock for item with ID ${item._id}:`,
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
      className={`offcanvas offcanvas-end ${offcanvasOpen ? "show" : ""}`} // Agregado la clase 'show' si offcanvasOpen es true
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
              <li key={item._id} className={styles["cart-item"]}>
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
                        onClick={() => removeOneFromCartHandler(item._id)}
                      >
                        Remove One
                      </button>
                      <button
                        className={`btn btn-outline-primary ${styles["btn-remove-all"]}`}
                        onClick={() => removeFromCartHandler(item._id)}
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
          <>
            <button
              className={`btn btn-success ${styles["btn-buy"]}`}
              onClick={handleBuyClick}
            >
              Buy Now
            </button>
            <button
              className={`btn btn-primary ${styles["btn-clear-cart"]}`}
              onClick={() => {
                console.log("Botón Clear Cart presionado");
                clearCartHandler();
              }}
            >
              Clear Cart
            </button>
          </>
        )}
      </div>

      {/* Modal de confirmación de compra */}
      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        className={styles.modalCustom} // Aplica la clase modal-custom al modal
      >
        <Modal.Header className={styles.customSection}>
          <Modal.Title>Confirm Purchase</Modal.Title>
          <button
            type="button"
            className={styles.newButton}
            onClick={handleClose}
          ></button>
        </Modal.Header>
        <Modal.Body className={styles.customSection}>
          <form>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                ref={emailInputRef} // Establecer la referencia al input del email
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-danger">{error}</p>}
          </form>
        </Modal.Body>
        <Modal.Footer className={styles.customPlusSection}>
          <Button
            className={`btn btn-primary ${styles["btn-custom"]}`}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePurchase}>
            Confirm Purchase
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OffcanvasContent;
