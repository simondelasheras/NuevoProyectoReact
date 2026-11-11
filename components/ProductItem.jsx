
import React, { useState, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import ProductDetails from "./ProductDetails";
import { cartsUrl, productsUrl } from "../utils/api";
import { Store, getData } from "../utils/Store";
import styles from "../styles/ProductItem.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProductItem({ product }) {
  const { state, dispatch } = useContext(Store);

  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const stock = Number(product.countInStock);
  const available = Number.isFinite(stock) && stock > 0 ? Math.floor(stock) : 0;
  const isOutOfStock = available <= 0;

  const handleShow = () => {
    if (isOutOfStock) return;
    setShowModal(true);
  };
  const handleClose = () => {
    setShowModal(false);
    setSelectedQuantity(1);
  };

  const handleQuantityChange = (e) => {
    const selectedQuantity = parseInt(e.target.value, 10);
    setSelectedQuantity(selectedQuantity);

    e.target.blur();
  };

  const { cart, products } = state;

  const addToCartHandler = () => {
    if (isOutOfStock || !Number.isInteger(selectedQuantity) || selectedQuantity < 1) return;
    if (selectedQuantity > available) return;
    setShowModal(false);
    setShowConfirmationModal(true);
  };
  const confirmAddToCart = async () => {
    try {
      const productInStock = products.find((p) => p._id === product._id);
      const existingCartItem = (cart && cart.cartItems ? cart.cartItems : []).find(
        (p) => p._id === product._id
      );

      if (
        productInStock &&
        productInStock.countInStock >= selectedQuantity &&
        selectedQuantity > 0
      ) {
        if (existingCartItem) {
          await axios.patch(
            `${cartsUrl}/${existingCartItem._id}`,
            {
              countInStock: existingCartItem.countInStock - selectedQuantity,
              inCart: existingCartItem.inCart + selectedQuantity,
            }
          );
        } else {
          await axios.post(cartsUrl, {
            ...product,
            countInStock: productInStock.countInStock - selectedQuantity,
            inCart: productInStock.inCart + selectedQuantity,
          });
        }
        await axios.patch(`${productsUrl}/${product._id}`, {
          countInStock: productInStock.countInStock - selectedQuantity,
          inCart: productInStock.inCart + selectedQuantity,
        });

        getData(dispatch);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }

    setShowModal(false);
    setShowConfirmationModal(false);
    setSelectedQuantity(1);
  };

  const cancelAddToCart = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="col">
      <div className={`card ${styles.card}`}>
        <h5 className={`card-title ${styles["custom-card-title"]}`}>
          {product.name}
        </h5>
        <img src={product.image} alt={product.name} className="imagen-card" />
        <div className="card-body">
          <p className="card-text">{product.patent}</p>
          <p className="card-text">{product.type}</p>
          <p className="card-text">${product.price}</p>
          <button
            className={`btn ${isOutOfStock ? "btn-secondary" : "btn-primary"} ${
              styles["btn-view-product"]
            }`}
            onClick={handleShow}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "View Product"}
          </button>

          <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header className={styles.customSection}>
              <button
                type="button"
                className={styles.newButton}
                onClick={handleClose}
              ></button>
              <Modal.Title>{product.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.customSection}>
              <ProductDetails product={product} />

              <div className="mb-3">
                <label htmlFor={`quantity-${product._id}`}>
                  <strong>Quantity:</strong>
                  &nbsp;
                </label>
                <select
                  className={`quantity-selector ${styles.quantitySelector}`}
                  id={`quantity-${product._id}`}
                  value={selectedQuantity}
                  onChange={handleQuantityChange}
                >
                  {[...Array(available).keys()].map((x) => (
                    <option key={x + 1} value={available - x}>
                      {available - x}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <strong>Subtotal: </strong>
                <span className={`subtotal-frame ${styles.subtotalFrame}`}>
                  ${selectedQuantity * product.price}
                </span>
              </div>
            </Modal.Body>
            <Modal.Footer className={styles.customPlusSection}>
              <Button
                variant="primary"
                onClick={addToCartHandler}
                className={styles["btn-add-to-cart"]}
              >
                Add to Cart
              </Button>

              <Button
                variant="secondary"
                onClick={handleClose}
                className={`${styles["btn-close-modal"]} ${styles["custom-background"]}`}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showConfirmationModal} centered>
            <Modal.Header className={styles.customSection}>
              <Modal.Title>Add to cart</Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.customSection}>
              <p>
                {`Do you want to add to your cart: `}
                <strong className={styles.quantityFrame}>
                  ({selectedQuantity}) {product.name}
                </strong>
                {`?`}
              </p>
              <p>
                <strong>Subtotal: </strong>
                <span className={`subtotal-frame ${styles.subtotalFrame}`}>
                  ${selectedQuantity * product.price}
                </span>
              </p>
            </Modal.Body>
            <Modal.Footer className={styles.customPlusSection}>
              <Button
                variant="primary"
                onClick={confirmAddToCart}
                className={styles["btn-yes"]}
              >
                Yes
              </Button>
              <Button
                variant="secondary"
                onClick={cancelAddToCart}
                className={`${styles["btn-no"]} ${styles["custom-background"]}`}
              >
                No
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
