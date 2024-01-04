/* eslint-disable @next/next/no-img-element */
import React, { useState, useContext, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import ProductDetails from "./ProductDetails";
import { Store } from "../utils/Store";
import styles from "../styles/ProductItem.module.css";

// Declara la función getData en el mismo archivo
const getData = async (dispatch) => {
  try {
    const res = await axios.get("http://localhost:5000/products");
    const res2 = await axios.get("http://localhost:5001/cart");
    // Despacha la acción para actualizar el estado
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
  

  // Llama a la función getData dentro de useEffect
  useEffect(() => {
    getData(dispatch);
  }, []); // Ejecuta solo una vez al montar el componente

  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleQuantityChange = (e) => {
    const selectedQuantity = parseInt(e.target.value, 10);
    setSelectedQuantity(selectedQuantity);
    // Agregar la siguiente línea para quitar el enfoque después de la selección
    e.target.blur();
  };


  const { cart, products } = state;


const addToCartHandler = (product) => {

  if (!isNaN(selectedQuantity) && selectedQuantity > 0) {
    // dispatch({
    //   type: "CART_ADD_ITEM",
    //   payload: { ...product, quantity: selectedQuantity },
    // });
    
    setShowModal(false);
    setShowConfirmationModal(true);
  }
}
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
    // const existingCartItem = cart.cartItems.find((p) => p.id === product.id);
    console.log("Existing Cart Item:", existingCartItem);
    if (productInStock && productInStock.countInStock >= selectedQuantity) {
      if (existingCartItem) {
        // Si el producto ya está en el carrito, actualiza la cantidad
        // const newQuantity = existingCartItem.inCart + selectedQuantity;
        await axios.patch(`http://localhost:5001/cart/${existingCartItem.id}`, {
          countInStock: existingCartItem.countInStock - selectedQuantity,
          inCart: existingCartItem.inCart + selectedQuantity,
        });
      } else {
        // Si el producto no está en el carrito, agrégalo
        await axios.post("http://localhost:5001/cart", {
          ...product,
          countInStock: productInStock.countInStock - selectedQuantity,
          inCart: productInStock.inCart + selectedQuantity,
        });
      }

      // Realiza una solicitud PATCH para actualizar el stock del producto
      await axios.patch(`http://localhost:5000/products/${product.id}`, {
        countInStock: productInStock.countInStock - selectedQuantity,
        inCart: productInStock.inCart + selectedQuantity,
      });

      // Llama a la función para obtener los datos actualizados
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
              <Button variant="primary" onClick={() => addToCartHandler(product)}>
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
