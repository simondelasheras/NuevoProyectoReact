import Layout from "../components/Layout";
import BootstrapCarousel from "../components/Carousel";
import SectionCards from "../components/Card";
import { ProductCategory } from "../utils/ProductUtils";
import Footer from "../components/Footer";
import styles from "../styles/Index.module.css";

export default function Home() {
  return (
    <div>
      <div>
        <Layout />
        <main>
          <BootstrapCarousel />
        </main>
      </div>

      <div>
        <section id="shop">
          <h2 className={`text-center mt-5 mb-5 ${styles.indexTitle}`}>SHOP</h2>
        </section>
        <SectionCards />
      </div>
      <div className="container2">
        <h2 className={`text-center mt-5 mb-5 ${styles.indexTitle}`}>
          LIST OF PRODUCTS
        </h2>
        <div className="container">
          <h2
            className={`text-center mt-5 mb-5 ${styles.indexTitle}`}
            id="men-section"
          >
            MEN
          </h2>
          <ProductCategory gender="Men" category="Top" />
          <ProductCategory gender="Men" category="Bottom" />
          <ProductCategory gender="Men" category="Shoes" />
          <h2
            className={`text-center mt-5 mb-5 ${styles.indexTitle}`}
            id="women-section"
          >
            WOMEN
          </h2>
          <ProductCategory gender="Women" category="Top" />
          <ProductCategory gender="Women" category="Bottom" />
          <ProductCategory gender="Women" category="Shoes" />
        </div>
      </div>
      <div id="footer">
        <Footer />
      </div>
    </div>
  );
}
