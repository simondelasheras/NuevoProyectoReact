// components/OffcanvasContent.jsx

import { useContext } from "react";
import { Store } from "../utils/Store";

const OffcanvasContent = ({ offcanvasInstance }) => {
  const { state } = useContext(Store);
  const { cart } = state;

  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id="offcanvasRight"
      aria-labelledby="offcanvasRightLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="offcanvasRightLabel">
          Shopping Cart
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <h6>Cart Content:</h6>
        <ul>
          {cart.cartItems.map((item) => (
            <li key={item.slug}>
              {item.name} - Quantity: {item.quantity} - Price: $
              {item.price * item.quantity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OffcanvasContent;
