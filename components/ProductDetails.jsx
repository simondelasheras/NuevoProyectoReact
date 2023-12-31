import React from 'react';
import styles from "../styles/ProductDetails.module.css";

export default function ProductDetails({ product }) {
  return (
    <div className={`card mb-3 maximo-card`}>
      <div className='row g-0'>
        <div className='col-md-4 d-flex align-items-center'>
          {/* Aplica el nuevo estilo a la imagen */}
          <img src={product.image} className={`img-fluid rounded-start`} alt='...' />
        </div>
        <div className='col-md-8'>
          <div className='card-body'>
            <h5 className='card-title'>{product.name}</h5>
            <p className='card-title'>Price: {product.price}$</p>
            <p className='card-title'>Patent: {product.patent}</p>
            <p className='card-title'>Type: {product.type}</p>
            <p className='card-title'>Category: {product.category}</p>
            <p className='card-text'>Gender: {product.gender}</p>
            <p>{product.countInStock > 0 ? 'In stock' : 'Unavailable'}</p>
            {/* Agrega más detalles según tus necesidades */}
          </div>
        </div>
      </div>
    </div>
  );
}

