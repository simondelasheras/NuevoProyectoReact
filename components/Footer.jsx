function Footer () {
    return (
        <footer className="footer-everything">

            <div className="footer-parte-izquierda">
            <h3 className="h3-footer-everything">Power <span className='span-footer-everything'>Sport</span></h3>

            <p className="footer-company-name">CopyRight@2023 <strong>Empower yourself. </strong>All rights reserved</p>
            </div>

            <div className="footer-centro">
                <div>
                    <img className="image1-footer-centro" src='/images/ubicacion.jpg' height={30} width={30}/>
                    <i className='ubicacion'></i>
                    <p className="p-1-footer">Buenos Aires</p>
                </div>

                <div>
                    <img className="image2-footer-centro" src='/images/Telefono.jpg' height={30} width={30}/>
                    <i className='ubicacion'></i>
                    <p className="p-2-footer">+54 911 4412-8340</p>
                </div>

                <div>
                    <img className="image3-footer-centro" src='https://imgur.com/WVgU2bW.jpg' height={30} width={30}/>
                    <i className='ubicacion'></i>
                    <p className="p-3-footer"><a href="#" className="a-1-footer-centro">powersport@gmail.com</a></p>
                </div>
                </div>

                <div className="footer-parte-derecha">
                    <p className="footer-company-about">
                    <span className="span-footer-company-about">About Us</span>
                    <strong>Unleash Your Potential. </strong>Power Sport presents a company with the best training courses and best prices. In our official store you can find a wide variety of clothing and different footwear, and we also have several gyms.
                    </p>

                    <div className="footer-iconos">
                        <a href="https://www.instagram.com/powersportindumentaria/?hl=es"><img className='instagram' src='https://imgur.com/45X5j6H.jpg' height={43} width={44}/></a>
                        <a href="https://www.facebook.com/powersports67/?locale=es_LA"><img className='facebook' src='https://imgur.com/pUbffmV.jpg' height={41} width={42}/></a>
                        <a href="https://twitter.com/Power987Sport"><img className='twitter' src='https://imgur.com/aiIbqOm.jpg' height={42} width={43}/></a>
                        <a href="https://www.youtube.com/watch?v=UvUmcyWNp9I"><img className='youtube'src='/images/youtube.png' height={44} width={55}/></a>
                    </div>
                </div>

        </footer>
    )
}


export default Footer