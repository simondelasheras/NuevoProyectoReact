// ProductUtils.js

import React from "react";
import ProductItem from "../components/ProductItem";
import data from "../utils/data";

export const filterProductsByGenderAndCategory = (gender, category) => {
  return data.products.filter(
    (product) => product.gender === gender && product.category === category
  );
};

export const renderProductCategory = (gender, category) => {
  const filteredProducts = filterProductsByGenderAndCategory(gender, category);

  // Verifica si hay productos en la categoría para este género
  if (filteredProducts.length > 0) {
    return (
      <div key={`${gender}-${category}`}>
        <h3 className="text-center mt-5 mb-5">{category}</h3>
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {filteredProducts.map((product) => (
            <ProductItem key={product.slug} product={product} />
          ))}
        </div>
      </div>
    );
  } else {
    return null; // No hay productos, no se renderiza nada
  }
};
