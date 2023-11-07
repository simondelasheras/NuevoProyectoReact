//carousels/Bootstrap.js
import { useState } from "react";
import { items } from "../pages/items/Items.json";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../styles/Carousel.module.css"

export default function BootstrapCarousel() {
  const { bootstrap } = items;
  const [index, setIndex] = useState(0);
  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };
  return (
    <Carousel activeIndex={index} onSelect={handleSelect}>
      {bootstrap.map((item) => (
        <Carousel.Item key={item.id} interval={4000}>
          <img src={item.imageUrl} alt="slides" />
          <Carousel.Caption>
            <h3 className={styles.carouselTitle} >{item.title}</h3>
            <p className={styles.carouselBody} >{item.body}</p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
