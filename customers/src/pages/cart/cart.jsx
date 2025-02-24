import React from "react";
import CartItem from "../../components/cartItem/cartItem";
import data from "../../data";
import "./cart.css";

const Cart = () => {
    const totalAmount = data.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <>
            <div className="cart">
                <div className="container-cart">
                    {data.cartItems.map((item, index) => (
                        <CartItem key={index} item={item} />
                    ))}
                </div>
                <div className="container-payment">
                    <h2>Order Summary</h2>
                    <div className="payment-products">
                        {data.cartItems.map((item, index) => (
                            <div key={index} className="payment-item">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <h3>Total: ${totalAmount.toFixed(2)}</h3>
                    
                    <div className="address-section">
                        <label>
                            Address:
                            <input type="text" placeholder="Enter your address" />
                        </label>
                        <label>
                            Phone Number:
                            <input type="text" placeholder="Enter your phone number" />
                        </label>
                    </div>

                    <div className="payment-methods">
                        <h4>Select Payment Method</h4>
                        <label className="radio-button">
                            <input type="radio" name="payment" />
                            <img src="https://via.placeholder.com/50" alt="Credit Card" />
                            Credit Card
                        </label>
                        <label className="radio-button">
                            <input type="radio" name="payment" />
                            <img src="https://via.placeholder.com/50" alt="PayPal" />
                            PayPal
                        </label>
                    </div>

                    <button className="confirm-button">Confirm Order</button>
                </div>
            </div>
        </>
    );
};

export default Cart;