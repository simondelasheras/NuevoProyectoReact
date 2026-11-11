
import { useState, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { Store, getData } from "../utils/Store";
import {
  readPendingCart,
  rememberPendingCart,
  settlePendingCart,
} from "../utils/settleCart";
import styles from "../styles/OffCanvasContent.module.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const OffcanvasContent = ({ offcanvasInstance }) => {
  const { state, dispatch } = useContext(Store);
  const { cart, cartStatus, settleStatus } = state;
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  const emailInputRef = useRef(null);
  const offcanvasRef = useRef(null);
  // Bootstrap marca el panel como abierto en el DOM. El flag evita que un
  // render de React le saque la clase "show" y deje el fondo oscuro colgado.
  const offcanvasVisibleRef = useRef(false);

  useEffect(() => {
    const element = offcanvasRef.current;
    if (!element) {
      return undefined;
    }

    const onShow = () => {
      offcanvasVisibleRef.current = true;
    };
    const onHide = () => {
      offcanvasVisibleRef.current = false;
    };

    element.addEventListener("show.bs.offcanvas", onShow);
    element.addEventListener("hide.bs.offcanvas", onHide);

    return () => {
      element.removeEventListener("show.bs.offcanvas", onShow);
      element.removeEventListener("hide.bs.offcanvas", onHide);
    };
  }, []);

  useLayoutEffect(() => {
    const element = offcanvasRef.current;
    if (element && offcanvasVisibleRef.current) {
      element.classList.add("show");
    }
  });

  useEffect(() => {
    if (showModal && !purchaseSuccess && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [showModal, purchaseSuccess]);

  // Cierra el panel con la API de Bootstrap para que retire su propio
  // fondo oscuro (offcanvas-backdrop), el bloqueo de scroll y el foco.
  // Abre el modal recién cuando Bootstrap terminó de cerrar el panel, para que
  // el modal no guarde como "estado original" el body con el scroll bloqueado.
  const hideOffcanvasThen = (callback) => {
    const element = offcanvasRef.current;
    if (typeof window === "undefined" || !window.bootstrap || !element) {
      callback();
      return;
    }
    const instance = window.bootstrap.Offcanvas.getInstance(element);
    if (!instance || !element.classList.contains("show")) {
      callback();
      return;
    }
    element.addEventListener("hidden.bs.offcanvas", callback, { once: true });
    instance.hide();
  };

  const handleBuyClick = () => {
    hideOffcanvasThen(() => setShowModal(true));
  };

  const handleClose = () => {
    setShowModal(false);
    setEmail("");
    setError("");
    setPurchaseSuccess("");
    setPurchasing(false);
  };

  const retrySettle = async () => {
    setPurchasing(true);
    try {
      const hadPending = readPendingCart();
      const result = hadPending
        ? await settlePendingCart()
        : { ok: true, emailSent: false };

      if (hadPending && result.ok) {
        dispatch({ type: "SETTLE_OK" });
        if (result.emailSent) {
          setError("");
          setPurchaseSuccess("Your purchase is confirmed.");
          setShowModal(true);
        }
      } else if (hadPending) {
        dispatch({ type: "SETTLE_FAILED" });
        setPurchaseSuccess("");
        setError(
          result.emailSent
            ? "Your purchase is confirmed, but we couldn't update the cart."
            : "We couldn't update the cart."
        );
        if (result.emailSent) setShowModal(true);
      }

      await getData(dispatch);
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchase = async () => {
    if (purchasing || purchaseSuccess) return;

    const pending = readPendingCart();
    if (pending && pending.emailSent) {
      await retrySettle();
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    const items = cart && Array.isArray(cart.cartItems) ? cart.cartItems : [];
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setPurchasing(true);
    try {
      await axios.post("http://localhost:9090/api/buy", {
        email,
        products: items,
      });
      rememberPendingCart(items, true);
    } catch (purchaseError) {
      console.error("Error processing purchase:", purchaseError);
      setError("We couldn't complete the purchase. Please try again.");
      setPurchasing(false);
      return;
    }

    setPurchasing(false);
    await retrySettle();
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
    const items = cart && Array.isArray(cart.cartItems) ? cart.cartItems : [];
    if (items.length === 0) return;
    rememberPendingCart(items, false);
    await retrySettle();
  };

  const pendingPurchase = readPendingCart();
  const retryingSentPurchase = Boolean(
    pendingPurchase && pendingPurchase.emailSent && !purchaseSuccess
  );

  return (
    <div
      ref={offcanvasRef}
      className="offcanvas offcanvas-end"
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
        {settleStatus === "error" && (
          <div className={styles.cartEmptyMessage} role="alert">
            <p>
              {pendingPurchase && pendingPurchase.emailSent
                ? "Your purchase is confirmed, but we couldn't update the cart."
                : "We couldn't update the cart."}
            </p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={retrySettle}
              disabled={purchasing}
            >
              Retry
            </button>
          </div>
        )}
        {cartStatus === "error" ? (
          <div className={styles.cartEmptyMessage} role="alert">
            <p>We couldn&apos;t load the cart</p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={retrySettle}
              disabled={purchasing}
            >
              Retry
            </button>
          </div>
        ) : cartStatus === "loading" &&
          !(cart && cart.cartItems && cart.cartItems.length > 0) ? (
          <div className={styles.cartEmptyMessage} aria-busy="true">
            Loading cart...
          </div>
        ) : cart && cart.cartItems && cart.cartItems.length > 0 ? (
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
        {cartStatus !== "error" && cart && cart.cartItems && cart.cartItems.length > 0 && (
          <div className={styles["cart-total"]}>
            <div className={styles["cart-total-label"]}>Total:</div>
            <div className={styles["cart-total-amount"]}>
              ${cart.cartItems.reduce((a, c) => a + c.inCart * c.price, 0)}
            </div>
          </div>
        )}
        {cartStatus !== "error" && cart && cart.cartItems && cart.cartItems.length > 0 && (
          <>
            <button
              className={`btn btn-success ${styles["btn-buy"]}`}
              onClick={handleBuyClick}
            >
              Buy Now
            </button>
            <button
              className={`btn btn-primary ${styles["btn-clear-cart"]}`}
              onClick={clearCartHandler}
              disabled={purchasing}
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
          <Modal.Title>
            {purchaseSuccess
              ? "Purchase complete"
              : retryingSentPurchase
              ? "Purchase received"
              : "Confirm Purchase"}
          </Modal.Title>
          <button
            type="button"
            className={styles.newButton}
            onClick={handleClose}
          ></button>
        </Modal.Header>
        <Modal.Body className={styles.customSection}>
          {purchaseSuccess ? (
            <p>{purchaseSuccess}</p>
          ) : retryingSentPurchase ? (
            <p>{error || "Your purchase is confirmed, but we couldn't update the cart."}</p>
          ) : (
            <form>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  ref={emailInputRef}
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
          )}
        </Modal.Body>
        <Modal.Footer className={styles.customPlusSection}>
          {purchaseSuccess ? (
            <Button
              className={`btn btn-primary ${styles["btn-custom"]}`}
              onClick={handleClose}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                className={`btn btn-primary ${styles["btn-custom"]}`}
                onClick={handleClose}
              >
                {retryingSentPurchase ? "Close" : "Cancel"}
              </Button>
              <Button
                variant="primary"
                onClick={handlePurchase}
                className={styles["btn-confirm"]}
                disabled={purchasing}
              >
                {retryingSentPurchase ? "Retry" : "Confirm Purchase"}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OffcanvasContent;
