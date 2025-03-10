import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CartItem from "../../components/cartItem/cartItem";
import "./cart.css";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const accountId = localStorage.getItem("accountId"); // Lấy accountId từ localStorage

    useEffect(() => {
        if (!accountId) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem giỏ hàng.");
            return;
        }

        const fetchCart = async () => {
            try {
                const response = await axios.get(`http://localhost:8082/cart/${accountId}`);
                setCartItems(response.data.cartItems || []);
                setCheckoutItems(Array(response.data.cartItems.length).fill(false))
            } catch (error) {
                console.error("Lỗi khi tải giỏ hàng", error);
                setError("Không thể tải giỏ hàng, vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [accountId]);

    useEffect(() => {
        const filteredItems = cartItems.filter((_, index) => checkoutItems[index]);
        setSelectedItems(filteredItems);
        console.log(checkoutItems)
    }, [checkoutItems, cartItems]);

    const updateQuantity = useCallback((bookId, newQuantity) => {
        setCartItems(prevCart =>
            prevCart.map(item => item.bookId === bookId ? { ...item, quantity: newQuantity } : item)
        );
    }, []);

    const removeItem = useCallback((bookId) => {
        setCartItems(prevCart => prevCart.filter(item => item.bookId !== bookId));
    }, []);

    const updateCheckoutItems = (e, index) => {
        setCheckoutItems((prevArray) => 
            prevArray.map((_, i) => {if(i === index) return e.target.checked})
        )
    }

    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="cart">
            <div className="container-cart">
                {loading ? (
                    <p>Đang tải giỏ hàng...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : cartItems.length === 0 ? (
                    <p>Giỏ hàng của bạn đang trống.</p>
                ) : (
                    cartItems.map((item, index) => (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <input
                                type="checkbox"
                                className="cart-item-checkbox"
                                checked={checkoutItems[index]}
                                onChange={(e) => updateCheckoutItems(e, index)}
                            />
                            <CartItem 
                                key={item.bookId} 
                                item={item} 
                                accountId={accountId}
                                onUpdate={updateQuantity} 
                                onRemove={removeItem}
                            />
                        </div>
                    ))
                )}
            </div>

            <div className="container-payment">
                <h2>Order Summary</h2>
                <div className="payment-products">
                    {selectedItems.map((item) => (
                        <div key={item.bookId} className="payment-item">
                            <img src={item.bookImage} alt={item.bookName} className="cart-image" />
                            <div className="payment-info">
                                <span>{item.bookName} (x{item.quantity})</span>
                                <span>{(item.price * item.quantity).toLocaleString("vi-VN")} VND</span>
                            </div>
                        </div>
                    ))}
                </div>
                <h3>Total: {totalAmount.toLocaleString("vi-VN")} VND</h3>
                <button className="confirm-button" disabled={cartItems.length === 0}>
                    {cartItems.length === 0 ? "Giỏ hàng trống" : "Xác nhận đơn hàng"}
                </button>
            </div>
        </div>
    );
};

export default Cart;
