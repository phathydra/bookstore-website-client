import React, { useEffect, useState } from "react";
import axios from "axios";
import "./orderHistory.css";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState("Chờ xử lý");

    const accountId = localStorage.getItem("accountId");

    const fetchOrderById = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost:8082/api/orders/orderId/${orderId}`);
            setSelectedOrder(response.data);
            setIsModalOpen(true);
        } catch (err) {
            setError("Failed to fetch order details");
        }
    };

    useEffect(() => {
        if (!accountId) {
            setError("No account found");
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get(`http://localhost:8082/api/orders/${accountId}`);
                const data = response.data;

                if (data && data.length > 0) {
                    setOrders(data);
                } else {
                    setError("No orders found");
                }
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch orders");
                setLoading(false);
            }
        };

        fetchOrders();
    }, [accountId]);

    const filteredOrders = orders.filter(order => order.shippingStatus === filter);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="order-history">
            {/* Filter tabs */}
            <div className="filters">
                {["Chờ xử lý", "Đã nhận đơn", "Đang giao hàng", "Đã nhận hàng"].map((status, idx) => (
                    <button
                        key={idx}
                        className={`filter-button ${filter === status ? "active" : ""}`}
                        onClick={() => setFilter(status)}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders */}
            <div className="orders">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => {
                        const totalOrderPrice = order.orderItems.reduce((total, item) => total + (item.quantity * item.price), 0);

                        return (
                            <div 
                                key={index} 
                                className="order" 
                                onClick={() => fetchOrderById(order.orderId)}
                            >

                                {/* Display order items */}
                                <div className="order-items">
                                    <h4>Đơn hàng</h4>
                                    <ul>
                                        {order.orderItems && order.orderItems.map((item, idx) => (
                                            <li key={idx} className="order-item">
                                                <div className="order-item-details">
                                                    <div className="order-item-image">
                                                        <img src={item.bookImage} alt={item.bookName} width={50} height={50} />
                                                    </div>
                                                    <div className="order-item-info">
                                                        <p>{item.bookName}</p>
                                                        <p>{item.price} VND</p>
                                                        <p>x{item.quantity}</p>
                                                    </div>
                                                    <div className="order-item-total">
                                                        <p>Thành tiền: {item.quantity * item.price} VND</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="total-price">Tổng đơn hàng: {totalOrderPrice} VND</p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div>No orders found in this category</div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h3>Order Details</h3>
                        <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
                        <p><strong>Recipient:</strong> {selectedOrder.recipientName}</p>
                        <p><strong>Phone:</strong> {selectedOrder.phoneNumber}</p>
                        <p><strong>Total Price:</strong> {selectedOrder.totalPrice}</p>
                        <p><strong>Status:</strong> {selectedOrder.orderStatus}</p>
                        <p><strong>Shipping Status:</strong> {selectedOrder.shippingStatus}</p>
                        <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                        <p><strong>Order Date:</strong> {new Date(selectedOrder.dateOrder).toLocaleString()}</p>

                        {/* Display order items */}
                        <h4>Order Items:</h4>
                        <ul>
                            {selectedOrder.orderItems && selectedOrder.orderItems.map((item, idx) => (
                                <li key={idx}>
                                    <img src={item.bookImage} alt={item.bookName} width={50} height={50} />
                                    <p>{item.bookName}</p>
                                    <p>{item.price} VND</p>
                                    <p>x{item.quantity}</p>
                                    <p>Thành tiền: {item.quantity * item.price} VND</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
