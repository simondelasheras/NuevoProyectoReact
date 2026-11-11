import React from 'react';
import Card from 'react-bootstrap/Card';
import styles from "../styles/Card.module.css";
import Link from 'next/link';

function SectionCards() {
  return (
    <div className="mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <Link href="#men-section">
              <Card className={`bg-dark text-white ${styles.firstCard}`}>
                <Card.Img
                  src="https://imgur.com/LU71eiy.jpg"
                  alt="Men section"
                />
                <Card.ImgOverlay>
                  <Card.Title className={styles.cardTitle}>
                    Men Section
                  </Card.Title>
                </Card.ImgOverlay>
              </Card>
            </Link>
          </div>
          <div className="col-md-6">
            <Link href="#women-section">
              <Card className={`bg-dark text-white ${styles.secondCard}`}>
                <Card.Img
                  src="https://imgur.com/knV47VB.jpg"
                  alt="Women section"
                />
                <Card.ImgOverlay>
                  <Card.Title className={styles.cardTitle}>
                    Women Section
                  </Card.Title>
                </Card.ImgOverlay>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionCards;

