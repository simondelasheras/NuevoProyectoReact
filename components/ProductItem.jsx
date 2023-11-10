/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Link from 'next/link'

export default function ProductItem({product}) {
  return (
    <div className='col'>
      <div className='card'>
        <img src={product.image} alt="" className='imagen-card' />
        <div className='card-body'>
            <h5 className='card-title'>{product.name}</h5>
            <p className='card-text'>{product.patent}</p>
            <p className='card-text'>{product.type}</p>
            <p className='card-text'>{product.price}$</p>
            <Link href={`/product/${product.slug}`}>
                 <button className='btn btn-primary' >
                View product
            </button>
            </Link>
            
        </div>
      </div>
    </div>
  )
}
