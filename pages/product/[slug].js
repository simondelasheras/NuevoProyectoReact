// // slug.js
// import React, { useContext } from "react";
// import Layout from "../../components/Layout";
// import Router, { useRouter } from "next/router";
// import data from "../../utils/data";
// import { Store } from "../../utils/Store";

// export default function ProductScreen() {
//   const { state, dispatch } = useContext(Store);

//   const router = useRouter();

//   const { query } = useRouter();
//   const { slug } = query;

//   const product = data.products.find((x) => x.slug === slug);

//   if (!product) {
//     return <div>product not found</div>;
//   }

// const addToCartHandler = async () => {
//   try {
//     const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
//     const quantity = existItem ? existItem.quantity + 1 : 1;

//     if (product.countInStock < quantity) {
//       alert("Sorry. Product is out of stock");
//       return;
//     }

//     // Realiza una solicitud POST para agregar el producto al carrito
//     await axios.post("http://localhost:5000/cart", {
//       ...product,
//       quantity,
//     });

//     // Despacha una acción para actualizar el estado del carrito
//     dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });

//     // Redirige a la página del carrito
//     router.push("/cart");
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//   }
// };

//   return (
//     <div>
//       <Layout title={"product screen"}>
//         <h2 className="text-center mt-5 mb-5">Single Product</h2>
//         <div className="container">
//           <button
//             className="btn btn-secondary mb-4"
//             onClick={() => router.push("/")}
//           >
//             Back to store
//           </button>
//           <div className="card mb-3 maximo-card">
//             <div className="row g-0">
//               <div className="col-md-4">
//                 <img
//                   src={product.image}
//                   className="img-fluid rounded-start"
//                   alt="..."
//                 />
//               </div>
//               <div className="col-md-8">
//                 <div className="card-body">
//                   <h5 className="card-title">{product.name}</h5>
//                   <p className="card-title">price: {product.price}$</p>
//                   <p className="card-title">patent: {product.patent}</p>
//                   <p className="card-title">type: {product.type}</p>
//                   <p className="card-title">category: {product.category}</p>
//                   <p className="card-text">gender: {product.gender}</p>
//                   <p>{product.countInStock > 0 ? "In stock" : "Unavailable"}</p>
//                   <button
//                     className="btn btn-primary"
//                     onClick={addToCartHandler}
//                   >
//                     Add to Cart
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Layout>
//     </div>
//   );
// }
