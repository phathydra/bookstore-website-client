import React from "react";
import "./product.css";

const Product = ({ product }) => {
    return (
        <div className="product-container">
            <img className="product-image" src={product.image} alt={product.name} />
            <div className="product-details">
                <div className="product-name-text">{product.name}</div>
                <div className="product-author-text">{product.author}</div>
                <div className="product-price-text">{product.price} vnd</div>
            </div>
        </div>
    );
};

export default Product;