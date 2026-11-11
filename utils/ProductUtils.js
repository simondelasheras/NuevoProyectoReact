
import React, { useContext } from "react";
import ProductItem from "../components/ProductItem";
import { Store } from "../utils/Store";
import styles from "../styles/Index.module.css";

export const filterProductsByGenderAndCategory = (
  gender,
  category,
  products
) => {
  return products.filter(
    (product) => product.gender === gender && product.category === category
  );
};

export function ProductCategory({ gender, category }) {
  const { state } = useContext(Store);

  const filteredProducts = filterProductsByGenderAndCategory(
    gender,
    category,
    state.products || []
  );

  if (filteredProducts.length === 0) return null;

  return (
    <div>
      <h3 className={`text-center mt-5 mb-5 ${styles.indexTitle}`}>
        {category}
      </h3>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {filteredProducts.map((product) => (
          <ProductItem key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
