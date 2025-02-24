import React from "react";
import Order from "../../components/order/order";
import data from "../../data.jsx";
import "./orderHistory.css";

const OrderHistory = () => {
    return (
        <>
            <div className="order-history">
                {data.orders.map((order, index) => (
                    <Order order={order} key={index} />
                ))}
            </div>
        </>
    );
};

export default OrderHistory;