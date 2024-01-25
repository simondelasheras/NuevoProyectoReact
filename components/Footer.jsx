import React from "react";
import styles from "../styles/Footer.module.css";

const informacionContacto = [
  { imgSrc: "/images/ubicacion.jpg", texto: "Buenos Aires" },
  { imgSrc: "/images/Telefono.jpg", texto: "+54 911 4412-8340" },
  {
    imgSrc: "https://imgur.com/WVgU2bW.jpg",
    texto: "powersport@gmail.com",
    enlace: "mailto:powersport@gmail.com",
  },
];

const enlacesRedesSociales = [
  {
    imgSrc: "https://imgur.com/45X5j6H.jpg",
    alt: "Instagram",
    enlace: "https://www.instagram.com/powersportindumentaria/?hl=es",
  },
  {
    imgSrc: "https://imgur.com/pUbffmV.jpg",
    alt: "Facebook",
    enlace: "https://www.facebook.com/powersports67/?locale=es_LA",
  },
  {
    imgSrc: "https://imgur.com/aiIbqOm.jpg",
    alt: "Twitter",
    enlace: "https://twitter.com/Power987Sport",
  },
  {
    imgSrc: "/images/youtube.png",
    alt: "YouTube",
    enlace: "https://www.youtube.com/@powersports8207",
  },
];

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.brand}>
          <h3>
            Power <span>Sport</span>
          </h3>
          <p>
            CopyRight@2023 <strong>Empower yourself. </strong>All rights
            reserved.
          </p>
        </div>

        <div className={styles.contactInfo}>
          {informacionContacto.map((info, index) => (
            <div key={index}>
              <img src={info.imgSrc} alt={info.texto} />
              {info.enlace ? (
                <p>
                  <a href={info.enlace}>{info.texto}</a>
                </p>
              ) : (
                <p>{info.texto}</p>
              )}
            </div>
          ))}
        </div>

        <div className={styles.aboutUs}>
          <h3>
            About <span>Us</span>
          </h3>
          <p>
            <strong>Unleash Your Potential </strong>
            Power Sport introduces a brand committed to delivering top-quality
            athletic gear at the best prices. Explore our official store to
            discover a diverse range of high-performance sportswear and footwear
            for all your training needs.
          </p>
          <div className={styles.socialLinks}>
            {enlacesRedesSociales.map((enlace, index) => (
              <a key={index} href={enlace.enlace} target="_blank">
                <img src={enlace.imgSrc} alt={enlace.alt} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
