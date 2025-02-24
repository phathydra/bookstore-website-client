import React from "react";
import "./order.css";

const Order = ({ order }) => { // Destructure the order object from props
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="container">
            <p className="time-display">Ngày đặt hàng: {formatTime(order.time)}</p>
            <p className="payment-display">Phương thức thanh toán: {order.paymentMethod}</p>
            <p className="status-display">Trạng thái giao hàng: {order.status}</p>
            <p className="phone-display">SĐT: {order.phoneNumber}</p>
            <p className="address-display">Địa chỉ: {order.deliveryAddress}</p>
            <div className="items-display">
                <p>Hàng đã mua:</p>
                {order.items.map((item, index) => (
                    <span key={index}>
                        {item.name} x {item.quantity}
                        {index !== order.items.length - 1 ? ", " : ""}
                    </span>
                ))}
            </div>
            <p className="total-display">
                Tổng tiền: {Number(order.totalAmount).toLocaleString("vi-VN")} VND
            </p>
        </div>
    );
};

export default Order;