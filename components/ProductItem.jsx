/* eslint-disable @next/next/no-img-element */
import React, { useState, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import ProductDetails from "./ProductDetails";
import { Store } from "../utils/Store";
import styles from "../styles/ProductItem.module.css";

export default function ProductItem({ product }) {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { state, dispatch } = useContext(Store);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value, 10);
    setSelectedQuantity(quantity);
    // Agregar la siguiente línea para quitar el enfoque después de la selección
    e.target.blur();
  };

  const addToCartHandler = () => {
    if (product.countInStock < selectedQuantity) {
      alert("Sorry. Product is out of stock");
      return;
    }

    setShowModal(false);
    setShowConfirmationModal(true);
  };

  const confirmPurchaseHandler = () => {
    dispatch({
      type: "CARD_ADD_ITEM",
      payload: { ...product, quantity: selectedQuantity },
    });

    setShowModal(false);
    setShowConfirmationModal(false);
  };

  const cancelPurchaseHandler = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="col">
      <div className="card">
        <img src={product.image} alt="" className="imagen-card" />
        <div className="card-body">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text">{product.patent}</p>
          <p className="card-text">{product.type}</p>
          <p className="card-text">${product.price}</p>
          <button className="btn btn-primary" onClick={handleShow}>
            View product
          </button>

          {/* Modal */}
          <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>{product.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ProductDetails product={product} />

              {/* Selección de cantidad */}
              <div className="mb-3">
                <label htmlFor="quantity">
                  <strong>Quantity:</strong>&nbsp;
                </label>
                <select
                  id="quantity"
                  value={selectedQuantity}
                  onChange={handleQuantityChange}
                >
                  {[...Array(product.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={product.countInStock - x}>
                      {product.countInStock - x}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtotal */}
              <div>
                <strong>Subtotal: </strong>
                <span className={`subtotal-frame ${styles.subtotalFrame}`}>
                  ${selectedQuantity * product.price}
                </span>
              </div>
            </Modal.Body>
            <Modal.Footer>
              {/* Invierte el orden de los botones */}
              <Button variant="primary" onClick={addToCartHandler}>
                Add to Cart
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal de confirmación de compra */}
          <Modal show={showConfirmationModal} centered>
            <Modal.Header>
              <Modal.Title>Confirm Purchase</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                {`Do you want to confirm the purchase of: `}
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
            <Modal.Footer>
              {/* Invierte el orden de los botones */}
              <Button variant="primary" onClick={confirmPurchaseHandler}>
                Yes
              </Button>
              <Button variant="secondary" onClick={cancelPurchaseHandler}>
                No
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
