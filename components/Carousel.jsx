// carousels/Bootstrap.js
import { useState } from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../styles/Carousel.module.css";

export default function BootstrapCarousel() {
  const [index, setIndex] = useState(0);
  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <Carousel activeIndex={index} onSelect={handleSelect}>
      <Carousel.Item interval={4000}>
        <img src="https://i.imgur.com/JyZlK8G.jpg" alt="slide1" />
        <Carousel.Caption>
          <h3 className={styles.carouselTitle}>WELCOME TO POWER SPORT</h3>
          <p className={styles.carouselBody}>Online Store</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item interval={4000}>
        <img src="https://i.imgur.com/yiauOtc.jpg" alt="slide2" />
        <Carousel.Caption>
          <h3 className={styles.carouselTitle}>
            FIND ALL KINDS OF SPORTSWEAR
          </h3>
          <p className={styles.carouselBody}>Men</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item interval={4000}>
        <img src="https://i.imgur.com/CAcxy1h.jpg" alt="slide3" />
        <Carousel.Caption>
          <h3 className={styles.carouselTitle}>
            FOR ALL GENDERS
          </h3>
          <p className={styles.carouselBody}>Women</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item interval={4000}>
        <img src="https://i.imgur.com/n3H6ZD2.jpg" alt="slide4" />
        <Carousel.Caption>
          <h3 className={styles.carouselTitle}>
            WE HAVE ALL TYPES OF FOOTWEAR FOR EVERY OCCASION
          </h3>
          <p className={styles.carouselBody}>Shoes</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}
