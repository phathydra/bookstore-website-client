import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Information</h4>
          <p>Address: 1 Vo Van Ngan Street, Thu Duc, HCMC</p>
          <p>Phone: (123) 456-7890</p>
          <p>Email: info@bookstore.com</p>
        </div>

        <div className="footer-section">
          <h4>Operating Hours</h4>
          <p>Monday - Friday: 8 AM - 10 PM</p>
          <p>Saturday - Sunday: 8 AM - 11 PM</p>
        </div>

        <div className="footer-section map-section">
          <h4>Find Us Here</h4>
          <p>1 Vo Van Ngan Street, Thu Duc, Ho Chi Minh City</p>
          <div className="map-iframe">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3918.4931669127473!2d106.76982246351999!3d10.850045041299259!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752763f23816ab%3A0x282f711441b6916f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBTxrAgcGjhuqFtIEvhu7kgdGh14bqtdCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1730020898924!5m2!1svi!2s" 
              width="100%" 
              height="200" 
              style={{ border: '0' }} 
              allowFullScreen="" 
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Book Store []. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;