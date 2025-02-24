import React, { useState } from "react";
import "./CartItem.css";

const CartItem = ({ item }) => {
    const [quantity, setQuantity] = useState(item.initialQuantity);
    const [isChecked, setIsChecked] = useState(false);

    const increaseQuantity = () => setQuantity(prevQuantity => prevQuantity + 1);
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const handleCheckboxChange = (e) => {
        setIsChecked(e.target.checked);
    };

    return (
        <div className={`cart-item ${isChecked ? "cart-item-checked" : ""}`}>
            <input 
                type="checkbox" 
                className="cart-item-checkbox" 
                checked={isChecked} 
                onChange={handleCheckboxChange} 
            />
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-details">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-author">{item.author}</p>
                <p className="cart-item-price">{Number(item.price).toLocaleString("vi-VN")} VND</p>
                <div className="cart-item-quantity">
                    <button onClick={decreaseQuantity} className="quantity-button">-</button>
                    <span>{quantity}</span>
                    <button onClick={increaseQuantity} className="quantity-button">+</button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
