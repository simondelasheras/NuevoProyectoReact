
import React, { useState, useContext, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import ProductDetails from "./ProductDetails";
import { Store } from "../utils/Store";
import styles from "../styles/ProductItem.module.css";
import "bootstrap/dist/css/bootstrap.min.css";


const getData = async (dispatch) => {
  try {
    const res = await axios.get("http://localhost:5000/products");
    const res2 = await axios.get("http://localhost:5001/cart");

    dispatch({
      type: "READ_STATE",
      payload: { 
        products: res.data ,
        cart: res2.data,
      },
    });
  } catch (error) {
    console.error("Error getting data:", error);
  }
};

export default function ProductItem({ product }) {
  const { state, dispatch } = useContext(Store);


  useEffect(() => {
    getData(dispatch);
  }, []); 

  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);


const initialButtonState = product.inCart === 20;

const [isOutOfStock, setIsOutOfStock] = useState(initialButtonState);


useEffect(() => {
  const updatedButtonState = product.inCart === 20;
  setIsOutOfStock(updatedButtonState);
}, [product.inCart]);

const handleShow = () => {

  if (isOutOfStock) {
    console.log("Out of Stock");
    return;
  }

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

  const addToCartHandler = (product) => {
    if (!isNaN(selectedQuantity) && selectedQuantity > 0) {


      setShowModal(false);
      setShowConfirmationModal(true);
    }
  };
  const confirmPurchaseHandler = async () => {
    try {
      console.log(state);

      const productInStock = products.find((p) => p.id === product.id);
      console.log(cart);
      const existingCartItem = cart.cartItems.find((p) => {
        console.log("product.id:", product.id);
        console.log("p.id:", p.id);
        return p.id === product.id;
      });

      console.log("Existing Cart Item:", existingCartItem);
      if (productInStock && productInStock.countInStock >= selectedQuantity) {
        if (existingCartItem) {

          await axios.patch(
            `http://localhost:5001/cart/${existingCartItem.id}`,
            {
              countInStock: existingCartItem.countInStock - selectedQuantity,
              inCart: existingCartItem.inCart + selectedQuantity,
            }
          );
        } else {

          await axios.post("http://localhost:5001/cart", {
            ...product,
            countInStock: productInStock.countInStock - selectedQuantity,
            inCart: productInStock.inCart + selectedQuantity,
          });
        }


        await axios.patch(`http://localhost:5000/products/${product.id}`, {
          countInStock: productInStock.countInStock - selectedQuantity,
          inCart: productInStock.inCart + selectedQuantity,
        });


        getData(dispatch);
      } else {
        console.log("Producto no disponible");
      }
      console.log("Cart después de la operación:", cart);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }

    setShowModal(false);
    setShowConfirmationModal(false);
    setSelectedQuantity(1);
  };

  const cancelPurchaseHandler = () => {
    setShowConfirmationModal(false);
    
  };

  return (
    <div className="col">
      <div className={`card ${styles.card}`}>
        <h5 className={`card-title ${styles["custom-card-title"]}`}>
          {product.name}
        </h5>
        <img src={product.image} alt="" className="imagen-card" />
        <div className="card-body">
          <p className="card-text">{product.patent}</p>
          <p className="card-text">{product.type}</p>
          <p className="card-text">${product.price}</p>
          <button
            className={`btn ${isOutOfStock ? "btn-secondary" : "btn-primary"}`}
            onClick={handleShow}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "View Product"}
          </button>

          {/* Modal */}
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

              {/* Selección de cantidad */}
              <div className="mb-3">
                <label htmlFor="quantity">
                  <strong>Quantity:</strong>
                  &nbsp;
                </label>
                <select
                  className={`quantity-selector ${styles.quantitySelector}`}
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
            <Modal.Footer className={styles.customPlusSection}>
              {/* Invierte el orden de los botones */}
              <Button
                variant="primary"
                onClick={() => addToCartHandler(product)}
              >
                Add to Cart
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
                className={styles["custom-background"]}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal de confirmación de compra */}
          <Modal show={showConfirmationModal} centered>
            <Modal.Header className={styles.customSection}>
              <Modal.Title>Confirm Purchase</Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.customSection}>
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
            <Modal.Footer className={styles.customPlusSection}>
              {/* Invierte el orden de los botones */}
              <Button variant="primary" onClick={confirmPurchaseHandler}>
                Yes
              </Button>
              <Button
                variant="secondary"
                onClick={cancelPurchaseHandler}
                className={styles["custom-background"]}
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
