import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./orderDetail.css";

const OrderDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedBooks, address, totalAmount } = location.state;

    const [paymentMethod, setPaymentMethod] = useState("COD"); // Default payment method

    const handlePlaceOrder = async () => {
        const order = {
            accountId: localStorage.getItem("accountId"),
            phoneNumber: address.phoneNumber,
            recipientName: address.recipientName,
            country: "Vietnam",
            city: address.city,
            district: address.district,
            ward: address.ward,
            note: address.note,
            totalPrice: totalAmount,
            paymentMethod: paymentMethod,
            orderItems: selectedBooks.map(item => ({
                bookId: item.bookId,
                bookName: item.bookName,
                bookImage: item.bookImage,
                quantity: item.quantity,
                price: item.discountedPrice !== undefined && item.discountedPrice !== null
                    ? item.discountedPrice
                    : item.price
            })),
            orderStatus: "Chưa thanh toán",
            shippingStatus: "Chờ xử lý"
        };

        try {
            const response = await axios.post("http://localhost:8082/api/orders/create", order);
            if (response.status === 200) {
                alert("Đặt hàng thành công!");
                navigate("/orderhistory");
            } else {
                alert("Có lỗi xảy ra khi đặt hàng.");
            }
        } catch (error) {
            console.error("Lỗi khi gửi đơn hàng:", error);
            alert("Đặt hàng không thành công, vui lòng thử lại sau.");
        }
    };

    return (
        <div className="order-detail-wrapper">
            <div className="order-detail">
                <h2>Chi tiết đơn hàng</h2>
                <div className="order-info">
                    <h3>Thông tin người nhận</h3>
                    <div className="info-item">
                        <label>Tên người nhận: </label>
                        <span>{address.recipientName}</span>
                    </div>
                    <div className="info-item">
                        <label>Số điện thoại: </label>
                        <span>{address.phoneNumber}</span>
                    </div>
                    <div className="info-item">
                        <label>Địa chỉ: </label>
                        <span>{address.city}, {address.district}, {address.ward}</span>
                    </div>
                    <div className="info-item">
                        <label>Ghi chú: </label>
                        <span>{address.note}</span>
                    </div>
                </div>
                <div className="order-items">
                    <h3>Sản phẩm đã chọn</h3>
                    {selectedBooks.map(item => (
                        <div key={item.bookId} className="order-item">
                            <img src={item.bookImage} alt={item.bookName} className="order-item-image" />
                            <div className="order-item-info">
                                <div className="order-item-name">
                                    <label>Tên sản phẩm: </label>
                                    <span>{item.bookName}</span>
                                </div>
                                <div className="order-item-quantity">
                                    <label>Số lượng: </label>
                                    <span>{item.quantity}</span>
                                </div>
                                <div className="order-item-price">
                                    <label>Giá: </label>
                                    <span>
                                        {(item.discountedPrice !== undefined && item.discountedPrice !== null
                                            ? item.discountedPrice
                                            : item.price
                                        ).toLocaleString("vi-VN")} VND
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="payment-method">
                    <h3>Phương thức thanh toán</h3>
                    <div className="payment-options">
                        <div>
                            <input
                                type="radio"
                                id="cod"
                                name="paymentMethod"
                                value="COD"
                                checked={paymentMethod === "COD"}
                                onChange={() => setPaymentMethod("COD")}
                            />
                            <label htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="bank"
                                name="paymentMethod"
                                value="Bank"
                                checked={paymentMethod === "Bank"}
                                onChange={() => setPaymentMethod("Bank")}
                            />
                            <label htmlFor="bank">Chuyển khoản ngân hàng</label>
                        </div>
                    </div>
                </div>

                <div className="order-total">
                    <h3>Tổng tiền: {totalAmount.toLocaleString("vi-VN")} VND</h3>
                </div>

                <button className="place-order-button" onClick={handlePlaceOrder}>
                    Đặt hàng
                </button>
            </div>
        </div>
    );
};

export default OrderDetail;