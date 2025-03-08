import React, { useState } from "react";
import axios from "axios";
import "./CartItem.css";

const CartItem = ({ item, accountId, onUpdate, onRemove }) => {
    const [quantity, setQuantity] = useState(item.quantity || 299);
    const [isChecked, setIsChecked] = useState(false);

    const updateQuantity = async (newQuantity) => {
        if (newQuantity <= 0) return;
        try {
            await axios.put(`http://localhost:8082/cart/update/${accountId}/${item.bookId}`, null, {
                params: { quantity: newQuantity }
            });
            setQuantity(newQuantity);
            onUpdate(item.bookId, newQuantity);
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng", error);
        }
    };

    const removeItem = async () => {
        try {
            await axios.delete(`http://localhost:8082/cart/remove/${accountId}/${item.bookId}`);
            onRemove(item.bookId);
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm", error);
        }
    };

    return (
        <div className={`cart-item ${isChecked ? "cart-item-checked" : ""}`}>
            <input
                type="checkbox"
                className="cart-item-checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
            />
            <img src={item.bookImage} alt={item.bookName} className="cart-item-image" />
            <div className="cart-item-details">
                <p className="cart-item-name">{item.bookName}</p>
                <p className="cart-item-price">{Number(item.price || 1).toLocaleString("vi-VN")} VND</p>
                <div className="cart-item-quantity">
                    <button onClick={() => updateQuantity(quantity - 1)} className="quantity-button">-</button>
                    <span>{quantity}</span>
                    <button onClick={() => updateQuantity(quantity + 1)} className="quantity-button">+</button>
                </div>
                <button className="remove-button" onClick={removeItem}>Xóa</button>
            </div>
        </div>
    );
};

export default CartItem;
