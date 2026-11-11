import React, { useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Store } from "../utils/Store";
import styles from "../styles/logo.module.css";

const OffcanvasContent = dynamic(() => import("./OffCanvasContent"), {
  ssr: false,
});

export default function Layout({ children }) {
  const { state } = useContext(Store);
  const { cart, cartStatus, purchaseMessage } = state;

  const openOffcanvas = async () => {
    try {
      if (typeof window !== "undefined" && !window.bootstrapLoaded) {
        const bootstrap = await import(
          "bootstrap/dist/js/bootstrap.bundle.min.js"
        );
        window.bootstrap = bootstrap;
        window.bootstrapLoaded = true;
      }

      if (typeof window !== "undefined" && window.bootstrap) {
        const element = document.getElementById("offcanvasRight");
        if (!element) {
          return;
        }
        const offcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(element);
        offcanvas.show();
      }
    } catch (error) {
      console.error("Error loading Bootstrap:", error);
    }
  };

  return (
    <div>
      <Head>
        <title>Power Sport</title>
        <meta
          name="description"
          content="Tienda simulada de indumentaria deportiva. La compra envía un correo de confirmación y el stock se repone para que los productos sigan disponibles."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <Link href="/">
            <img
              src="https://i.imgur.com/mrT3S5k.jpg"
              alt="Power Sport"
              className={styles.navbarImg}
            />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link href="/" className="nav-link">
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link href="#shop" className="nav-link">
                  Shop
                </Link>
              </li>

              <li className="nav-item">
                <Link href="#footer" className="nav-link">
                  About
                </Link>
              </li>

              <li className="nav-item">
                <Link href="#footer" className="nav-link">
                  Contact
                </Link>
              </li>

              <li className="nav-item">
                <button className="nav-link" onClick={openOffcanvas}>
                  Cart{" "}
                  {cartStatus === "error" ? (
                    <span
                      className="text-dark bg-warning rounded p-1"
                      aria-label="We couldn't load the cart"
                    >
                      !
                    </span>
                  ) : cart && Array.isArray(cart.cartItems) ? (
                    <span className="text-white bg-danger rounded p-1">
                      {cart.cartItems.length}
                    </span>
                  ) : (
                    <span
                      className="text-white bg-secondary rounded p-1"
                      aria-busy="true"
                      aria-label="Loading cart"
                    >
                      ...
                    </span>
                  )}{" "}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {purchaseMessage ? (
        <p role="alert" className="alert alert-warning text-center mb-0">
          {purchaseMessage}
        </p>
      ) : null}
      <main>{children || null}</main>{" "}
      <OffcanvasContent />
    </div>
  );
}
