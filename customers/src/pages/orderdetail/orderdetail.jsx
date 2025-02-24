import React from 'react';
import './orderdetail.css';

const OrderDetail = () => {
  const order = {
    id: 1,
    customerId: 123,
    totalPrice: 150000,
    orderDate: '2023-10-15',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Completed',
    deliveryStatus: 'Shipped',
    phone: '0123456789',
    deliveryAddress: '123 Literature Street, Book Town, BT',
  };

  const orderDetails = [
    { bookId: 101, quantity: 2, unitPrice: 50000, totalPrice: 100000 },
    { bookId: 102, quantity: 1, unitPrice: 50000, totalPrice: 50000 },
  ];

  return (
    <div className="order-details-container">
      <div className="order-card">
        <h2>Order Details</h2>
        <div className="order-summary">
          <h3>Order Information</h3>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Customer ID:</strong> {order.customerId}</p>
          <p><strong>Total Price:</strong> ${order.totalPrice}</p>
          <p><strong>Order Date:</strong> {order.orderDate}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          <p><strong>Delivery Status:</strong> {order.deliveryStatus}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
        </div>

        <div className="order-items">
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Quantity</th>
                <th>Unit Price ($)</th>
                <th>Total Price ($)</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((item, index) => (
                <tr key={index}>
                  <td>{item.bookId}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unitPrice}</td>
                  <td>{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;