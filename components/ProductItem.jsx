/* eslint-disable @next/next/no-img-element */
import React, { useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import ProductDetails from './ProductDetails';
import { Store } from '../utils/Store';

export default function ProductItem({ product }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { state, dispatch } = useContext(Store);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value, 10);
    setSelectedQuantity(quantity);
  };

  const addToCartHandler = () => {
    if (product.countInStock < selectedQuantity) {
      alert('Sorry. Product is out of stock');
      return;
    }

    dispatch({
      type: 'CARD_ADD_ITEM',
      payload: { ...product, quantity: selectedQuantity },
    });

    handleClose();
  };

  return (
    <div className='col'>
      <div className='card'>
        <img src={product.image} alt='' className='imagen-card' />
        <div className='card-body'>
          <h5 className='card-title'>{product.name}</h5>
          <p className='card-text'>{product.patent}</p>
          <p className='card-text'>{product.type}</p>
          <p className='card-text'>${product.price}</p>
          <button className='btn btn-primary' onClick={handleShow}>
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
              <div className='mb-3'>
                <label htmlFor='quantity'>Quantity:</label>
                <select
                  id='quantity'
                  value={selectedQuantity}
                  onChange={handleQuantityChange}
                >
                  {[...Array(product.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtotal */}
              <div>Subtotal: ${selectedQuantity * product.price}</div>
            </Modal.Body>
            <Modal.Footer>
              <button className='btn btn-secondary' onClick={handleClose}>
                Close
              </button>
              {/* Agregar al carrito con la cantidad seleccionada */}
              <button
                className='btn btn-primary'
                onClick={addToCartHandler}
              >
                Add to Cart
              </button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

