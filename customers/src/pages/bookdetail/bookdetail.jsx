import React from 'react';
import './bookdetail.css';
import imagesources from '../../assets/images';

const BookDetail = () => {
  return (
    <div className="book-details-container">
      <div className="book-card">
        <div className="book-content">
          <div className="book-image">
            <img src={imagesources[0]} alt="Book Cover" />
          </div>
          <div className="book-info">
            <h2>The name</h2>
            <p><strong>Author:</strong>...</p>
            <p><strong>Publisher:</strong> ...</p>
            <p><strong>Year Published:</strong> 2021</p>
            <p><strong>Language:</strong> Vietnamese</p>
            <p><strong>Categories:</strong>.....</p>
            <button className="add-to-cart-btn">
              <span className="cart-icon">🛒</span> Add to Cart
            </button>
          </div>
        </div>
        <div className="book-description">
          <h3>Description</h3>
          <p>
            Example description
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;