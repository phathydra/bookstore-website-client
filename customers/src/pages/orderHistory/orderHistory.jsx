import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("Tất cả");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentOrderToRate, setCurrentOrderToRate] = useState(null);
  const [ratings, setRatings] = useState({}); // { bookId: rating }
  const [comments, setComments] = useState({}); // { bookId: comment }

  const accountId = localStorage.getItem("accountId");

  const fetchOrderById = async (orderId) => {
    try {
      const response = await axios.get(
        `http://localhost:8082/api/orders/orderId/${orderId}`
      );
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
        const response = await axios.get(
          `http://localhost:8082/api/orders/${accountId}`
        );
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

  const filteredOrders = filter === "Tất cả"
    ? orders
    : orders.filter((order) => order.shippingStatus === filter);

  // Removed handleReceivedOrder function as the logic is now in handleSubmitReviews

  const handleOpenRatingModal = (order) => {
    setCurrentOrderToRate(order);
    // Initialize ratings and comments for each book in the order
    const initialRatings = {};
    const initialComments = {};
    order.orderItems.forEach(item => {
      initialRatings[item.bookId] = 1; // Default rating
      initialComments[item.bookId] = "";
    });
    setRatings(initialRatings);
    setComments(initialComments);
    setShowRatingModal(true);
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setCurrentOrderToRate(null);
    setRatings({});
    setComments({});
  };

  const handleRatingChange = (bookId, value) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [bookId]: parseInt(value),
    }));
  };

  const handleCommentChange = (bookId, value) => {
    setComments(prevComments => ({
      ...prevComments,
      [bookId]: value,
    }));
  };

  const handleSubmitReviews = async () => {
    if (!currentOrderToRate) return;

    try {
      const accountId = localStorage.getItem("accountId");
      for (const item of currentOrderToRate.orderItems) {
        const reviewData = {
          bookId: item.bookId,
          accountId: accountId,
          rating: ratings[item.bookId],
          comment: comments[item.bookId],
        };
        await axios.post("http://localhost:8081/api/reviews", reviewData);
      }
      handleCloseRatingModal();
      // Update shippingStatus after successful review submission
      const orderIdToUpdate = currentOrderToRate.orderId;
      await axios.put(
        `http://localhost:8082/api/orders/update-shipping-status/${orderIdToUpdate}?shippingStatus=Đã nhận hàng`
      );
      // Update state orders to reflect the change
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderIdToUpdate
            ? { ...order, shippingStatus: "Đã nhận hàng" }
            : order
        )
      );
      alert("Cảm ơn bạn đã đánh giá đơn hàng!");
    } catch (error) {
      console.error("Error submitting reviews:", error);
      setError("Failed to submit reviews.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-5 max-w-2xl mx-auto bg-gray-100 rounded-md shadow-md">
      {/* Filter tabs */}
      <div className="flex justify-center gap-3 mb-5">
        <button
          className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
            filter === "Tất cả"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={() => setFilter("Tất cả")}
        >
          Tất cả
        </button>
        {["Chờ xử lý", "Đã nhận đơn", "Đã nhận đơn", "Đang giao hàng", "Đã nhận hàng"].map(
          (status, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
                filter === status
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => {
            const totalOrderPrice = order.orderItems.reduce(
              (total, item) => total + item.quantity * item.price,
              0
            );

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-md shadow-sm"
              >
                <div className="p-4 flex justify-between items-center">
                  <div
                    className="cursor-pointer"
                    onClick={() => fetchOrderById(order.orderId)}
                  >
                    <h4 className="text-lg font-semibold mb-2">Đơn hàng</h4>
                    <ul>
                      {order.orderItems &&
                        order.orderItems.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-center py-2 border-b last:border-b-0"
                          >
                            <div className="w-12 h-12 mr-4">
                              <img
                                src={item.bookImage}
                                alt={item.bookName}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                            <div className="flex-grow">
                              <p className="text-sm font-medium text-gray-800">
                                {item.bookName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {item.price} VND
                              </p>
                              <p className="text-xs text-gray-600">
                                x{item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-800">
                                {item.quantity * item.price} VND
                              </p>
                            </div>
                          </li>
                        ))}
                    </ul>
                    <p className="mt-3 font-semibold text-gray-900 text-right">
                      Tổng đơn hàng: {totalOrderPrice} VND
                    </p>
                  </div>
                  {order.shippingStatus === "Đã giao" && (
                    <button
                      className="px-4 py-2 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                      onClick={() => handleOpenRatingModal(order)}
                    >
                      Đánh giá
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-gray-600">No orders found</div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed z-10 inset-0 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <span
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết đơn hàng
              </h3>
              <p className="mb-2">
                <strong>Mã đơn hàng:</strong> {selectedOrder.orderId}
              </p>
              <p className="mb-2">
                <strong>Người nhận:</strong> {selectedOrder.recipientName}
              </p>
              <p className="mb-2">
                <strong>Số điện thoại:</strong> {selectedOrder.phoneNumber}
              </p>
              <p className="mb-2">
                <strong>Tổng tiền:</strong> {selectedOrder.totalPrice} VND
              </p>
              <p className="mb-2">
                <strong>Trạng thái đơn hàng:</strong> {selectedOrder.orderStatus}
              </p>
              <p className="mb-2">
                <strong>Trạng thái giao hàng:</strong> {selectedOrder.shippingStatus}
              </p>
              <p className="mb-2">
                <strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod}
              </p>
              <p className="mb-4">
                <strong>Ngày đặt hàng:</strong>{" "}
                {new Date(selectedOrder.dateOrder).toLocaleString()}
              </p>

              <h4 className="text-md font-semibold text-gray-900 mb-2">
                Sản phẩm:
              </h4>
              <ul>
                {selectedOrder.orderItems &&
                  selectedOrder.orderItems.map((item, idx) => (
                    <li key={idx} className="flex items-center py-2 border-b last:border-b-0">
                      <div className="w-10 h-10 mr-3">
                        <img
                          src={item.bookImage}
                          alt={item.bookName}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-gray-800">{item.bookName}</p>
                        <p className="text-xs text-gray-600">
                          {item.price} VND
                        </p>
                        <p className="text-xs text-gray-600">
                          x{item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {item.quantity * item.price} VND
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
              {selectedOrder.shippingStatus === "Đã giao" && (
                <button
                  className="mt-4 px-4 py-2 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                  onClick={() => handleOpenRatingModal(selectedOrder)}
                >
                  Đánh giá
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && currentOrderToRate && (
        <div className="fixed z-20 inset-0 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <span
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={handleCloseRatingModal}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Đánh giá sản phẩm trong đơn hàng
              </h3>
              {currentOrderToRate.orderItems.map((item) => (
                <div key={item.bookId} className="mb-6 p-4 border rounded">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">
                    {item.bookName}
                  </h4>
                  <div className="mb-3">
                    <label
                      htmlFor={`rating-${item.bookId}`}
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Đánh giá (1 - 5 sao):
                    </label>
                    <select
                      id={`rating-${item.bookId}`}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={ratings[item.bookId] || 1}
                      onChange={(e) => handleRatingChange(item.bookId, e.target.value)}
                    >
                      <option value={1}>1 sao</option>
                      <option value={2}>2 sao</option>
                      <option value={3}>3 sao</option>
                      <option value={4}>4 sao</option>
                      <option value={5}>5 sao</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor={`comment-${item.bookId}`}
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Bình luận:
                    </label>
                    <textarea
                      id={`comment-${item.bookId}`}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={comments[item.bookId] || ""}
                      onChange={(e) => handleCommentChange(item.bookId, e.target.value)}
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              ))}
              <button
                className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={handleSubmitReviews}
              >
                Gửi đánh giá & Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;