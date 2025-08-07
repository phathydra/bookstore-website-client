import React, { useEffect, useState } from "react";
import axios from "axios";
import SideNavProfile from '../Profile/SideNavProfile'; 

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State quản lý hiển thị modal chi tiết
  const [filter, setFilter] = useState("Chờ xử lý");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('orders');

  const accountId = localStorage.getItem("accountId");

  useEffect(() => {
    if (!accountId) {
      setError("Không tìm thấy tài khoản");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8082/api/orders/${accountId}`)
      .then((res) => {
        setOrders(res.data || []);
        if (!res.data.length) setError("Không có đơn hàng nào");
      })
      .catch(() => setError("Lỗi khi tải đơn hàng"))
      .finally(() => setLoading(false));
  }, [accountId]);

  const fetchOrderById = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:8082/api/orders/orderId/${orderId}`);
      setSelectedOrder(res.data);
      setIsModalOpen(true); // Mở modal sau khi fetch dữ liệu
    } catch {
      setError("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null); // Reset selectedOrder khi đóng modal
  };

  const handleRatingOpen = (order) => {
    const rate = {}, comment = {};
    order.orderItems.forEach((item) => {
      rate[item.bookId] = 1;
      comment[item.bookId] = "";
    });
    setRatings(rate);
    setComments(comment);
    setSelectedOrder(order);
    setShowRatingModal(true);
  };

  const handleRatingChange = (bookId, value) =>
    setRatings((r) => ({ ...r, [bookId]: +value }));

  const handleCommentChange = (bookId, value) =>
    setComments((c) => ({ ...c, [bookId]: value }));

  const submitReview = async () => {
    if (!selectedOrder) return;
    try {
      for (const item of selectedOrder.orderItems) {
        await axios.post("http://localhost:8081/api/reviews", {
          bookId: item.bookId,
          accountId,
          rating: ratings[item.bookId],
          comment: comments[item.bookId],
        });
      }
      await axios.put(
        `http://localhost:8082/api/orders/update-shipping-status/${selectedOrder.orderId}?shippingStatus=Đã nhận hàng`
      );
      setOrders(
        orders.map((o) =>
          o.orderId === selectedOrder.orderId ? { ...o, shippingStatus: "Đã nhận hàng" } : o
        )
      );
      alert("Cảm ơn bạn đã đánh giá!");
      setShowRatingModal(false);
    } catch {
      setError("Lỗi khi gửi đánh giá");
    }
  };

  const handleCancelOpen = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
    setCancelReason(""); // Reset lý do hủy khi mở modal mới
  };

  const handleCancelReasonChange = (event) => {
    setCancelReason(event.target.value);
  };

  const submitCancellation = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng.");
      return;
    }
    try {
      await axios.post("http://localhost:8082/api/cancelled-orders/request", {
        orderId: selectedOrder.orderId,
        cancellationReason: cancelReason,
      });
      // Cập nhật trạng thái đơn hàng hiển thị trên giao diện (tùy chọn)
      setOrders(
        orders.map((o) =>
          o.orderId === selectedOrder.orderId ? { ...o, shippingStatus: "Đã yêu cầu hủy" } : o
        )
      );
      alert("Yêu cầu hủy đơn hàng đã được gửi.");
      setShowCancelModal(false);
    } catch (error) {
      setError("Lỗi khi gửi yêu cầu hủy đơn hàng");
      console.error("Lỗi hủy đơn hàng:", error);
    }
  };

  const filteredOrders = orders.filter((o) => o.shippingStatus === filter);

  if (loading)
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;

  if (error)
    return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden !gap-4 !p-4 !ml-30"> {/* Thêm md:flex-row, !gap-4, !p-4 */}
      {/* Sidebar (cố định) */}
      <SideNavProfile selected={selectedTab} onSelect={setSelectedTab} /> 
      {/* Main content (Order - có thể thu nhỏ) */}
      <div className="flex-1 overflow-y-auto max-w-[80%] mx-auto !mr-30"> {/* Thêm max-w và mx-auto */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
          {/* Filter */}
          <div className="overflow-x-auto mb-5"> {/* Thêm overflow-x-auto */}
            <div className="flex gap-3"> {/* Loại bỏ justify-center và flex-grow */}
              {["Chờ xử lý", "Đã nhận đơn", "Đang giao hàng", "Đã giao", "Đã nhận hàng", "Đã yêu cầu hủy", "Đã hủy"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 !rounded-xl font-semibold transition whitespace-nowrap ${
                    filter === status
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          {/* Orders */}
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500">Không có đơn hàng phù hợp</p>
          ) : (
            filteredOrders.map((order) => {
              const total = order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
              return (
                <div key={order.orderId} className="bg-white p-4 rounded shadow-sm mb-4">
                  <div onClick={() => fetchOrderById(order.orderId)} className="cursor-pointer">
                    <h4 className="text-lg font-semibold mb-2">Đơn hàng #{order.orderId}</h4>
                    {order.orderItems.map((item) => (
                      <div key={item.bookId} className="flex items-center gap-4 mb-2">
                        <img src={item.bookImage} alt={item.bookName} className="w-12 h-12 rounded" />
                        <div className="flex-grow">
                          <p>{item.bookName}</p>
                          <small>
                            {item.price} VND x {item.quantity}
                          </small>
                        </div>
                        <p className="font-semibold">{item.price * item.quantity} VND</p>
                      </div>
                    ))}
                    <p className="text-right font-bold">Tổng: {total} VND</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    {order.shippingStatus === "Chờ xử lý" && (
                      <button
                        onClick={() => handleCancelOpen(order)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                    {order.shippingStatus === "Đã giao" && (
                      <button
                        onClick={() => handleRatingOpen(order)}
                        className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                      >
                        Đã Nhận được hàng
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
  
        {/* Order Details Modal */}
        {isModalOpen && selectedOrder && (
          <div className="fixed z-10 inset-0 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <span
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={handleCloseModal}
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
                  Chi tiết đơn hàng #{selectedOrder.orderId}
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
              </div>
            </div>
          </div>
        )}
  
        {/* Rating Modal */}
        {showRatingModal && selectedOrder && (
          <div className="fixed inset-0 z-10 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                Đánh giá đơn hàng #{selectedOrder.orderId}
              </h3>
              {selectedOrder.orderItems.map((item) => (
                <div key={item.bookId} className="mb-4 px-4"> {/* Thêm px-4 ở đây để căn đều lề */}
                  <p className="font-medium">{item.bookName}</p>
                  <label>
                    Số sao:
                    <select
                      value={ratings[item.bookId]}
                      onChange={(e) => handleRatingChange(item.bookId, e.target.value)}
                      className="ml-2"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <option key={star} value={star}>
                          {star}
                        </option>
                      ))}
                    </select>
                  </label>
                  <textarea
                    value={comments[item.bookId]}
                    onChange={(e) => handleCommentChange(item.bookId, e.target.value)}
                    className="w-full border mt-2 p-2 rounded"
                    placeholder="Nhận xét"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 mt-4 px-4"> {/* Thêm px-4 ở đây để căn đều lề */}
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={submitReview}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Cancel Order Modal */}
        {showCancelModal && selectedOrder && (
          <div className="fixed inset-0 z-10 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                Hủy đơn hàng #{selectedOrder.orderId}
              </h3>
              <div className="mb-4">
                <label htmlFor="cancelReason" className="block text-gray-700 text-sm font-bold mb-2">
                  Lý do hủy:
                </label>
                <textarea
                  id="cancelReason"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="Nhập lý do hủy đơn hàng"
                  value={cancelReason}
                  onChange={handleCancelReasonChange}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  Đóng
                </button>
                <button
                  onClick={submitCancellation}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Gửi yêu cầu hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;