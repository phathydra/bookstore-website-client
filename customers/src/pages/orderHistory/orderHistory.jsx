import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import SideNavProfile from '../Profile/SideNavProfile'; // Giả định đường dẫn này là chính xác

// ====================================================================
// HẰNG SỐ CHUNG
// ====================================================================
const API_URL = "http://localhost:8082"; // API Orders
const MAP_API_URL = "http://localhost:8084"; // API Map / Shipping
const SHIPPER_LOCATION_INTERVAL = 10000; // 10 giây

// ====================================================================
// COMPONENT CHÍNH: Lịch sử Đơn hàng
// ====================================================================
const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState("Chờ xử lý");
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('orders');
    
    // State và Ref cho tính năng theo dõi Shipper
    const [shipperLocation, setShipperLocation] = useState(null);
    const locationIntervalRef = useRef(null);

    const accountId = localStorage.getItem("accountId");

    // ====================================================================
    // LOGIC CẬP NHẬT/CLEANUP VỊ TRÍ SHIPPER
    // ====================================================================
    
    // Hàm gọi API lấy vị trí Shipper
    const fetchShipperLocation = async (shipperId) => {
        if (!shipperId) return;
        try {
            // Lấy vị trí gần đây nhất của Shipper (latitude, longitude)
            const { data } = await axios.get(`${MAP_API_URL}/api/shippers/${shipperId}/location`);
            setShipperLocation(data);
        } catch (err) {
            console.error(`❌ Lỗi lấy vị trí shipper ${shipperId}:`, err.message);
            // Có thể giữ lại vị trí cũ hoặc set null tùy theo yêu cầu kinh doanh
        }
    };

    // useEffect để quản lý việc cập nhật vị trí Shipper tự động
    useEffect(() => {
        // Tìm đơn hàng đang giao để theo dõi
        const orderInShipping = orders.find(o => o.shippingStatus === "Đang giao" && o.shipperId);

        if (orderInShipping) {
            // Lấy vị trí lần đầu ngay lập tức
            fetchShipperLocation(orderInShipping.shipperId);

            // Bắt đầu interval nếu chưa có
            if (!locationIntervalRef.current) {
                locationIntervalRef.current = setInterval(() => {
                    fetchShipperLocation(orderInShipping.shipperId);
                }, SHIPPER_LOCATION_INTERVAL); 
            }
        } else {
            // Dọn dẹp interval khi không còn đơn nào đang giao
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
                locationIntervalRef.current = null;
            }
            setShipperLocation(null);
        }

        // Cleanup function
        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
        };
    }, [orders]); // Chạy lại khi danh sách đơn hàng thay đổi

    // ====================================================================
    // LOGIC LẤY ĐƠN HÀNG
    // ====================================================================
    useEffect(() => {
        if (!accountId) {
            setError("Không tìm thấy tài khoản");
            setLoading(false);
            return;
        }

        axios
            .get(`${API_URL}/api/orders/${accountId}`)
            .then((res) => {
                setOrders(res.data || []);
                if (!res.data.length) setError("Không có đơn hàng nào");
            })
            .catch(() => setError("Lỗi khi tải đơn hàng"))
            .finally(() => setLoading(false));
    }, [accountId]);

    // ====================================================================
    // HÀM XỬ LÝ XEM TUYẾN ĐƯỜNG
    // ====================================================================
    const handleRouteToCustomer = async (order) => {
        if (order.shippingStatus !== "Đang giao") {
            alert("Đơn hàng không ở trạng thái 'Đang giao'.");
            return;
        }
        if (!order.shipperId || !shipperLocation) {
            alert("Đang chờ cập nhật vị trí shipper. Vui lòng thử lại sau vài giây.");
            return;
        }
        
        try {
            // Tạo chuỗi địa chỉ đầy đủ của Khách hàng
            const customerAddress = [order.address, order.ward, order.district, order.city]
                                    .filter(Boolean)
                                    .join(", ");

            // 1. Chuẩn bị tham số cho API tính toán tuyến đường
            let params = { 
                currentLon: shipperLocation.longitude, 
                currentLat: shipperLocation.latitude,
                orderId: order.orderId // API Map dùng orderId để lấy tọa độ khách hàng từ API Orders
            };
            
            // 2. Gọi API để lấy tuyến đường từ Shipper đến Khách hàng
            const { data } = await axios.get(`${MAP_API_URL}/api/map/route/to-customer-address`, {
                params,
            });

            if (!data.routes?.length) throw new Error("Không tìm thấy tuyến đường.");

            // 3. Điều hướng sang MapView, truyền dữ liệu để vẽ bản đồ
            navigate("/map-view", {
                state: {
                    routeData: data,
                    origin: { lon: shipperLocation.longitude, lat: shipperLocation.latitude },
                    originAddress: `Vị trí hiện tại của Shipper (${order.shipperId.substring(0, 8)}...)`,
                    destinationAddress: `ĐỊA CHỈ NHẬN HÀNG: ${customerAddress}`,
                },
            });
        } catch (err) {
            alert(err.message || "Lỗi khi tính toán tuyến đường. Kiểm tra API Map.");
            console.error("Lỗi xem tuyến đường:", err);
        }
    };

    // ====================================================================
    // CÁC HÀM XỬ LÝ KHÁC (Không thay đổi)
    // ====================================================================
    const fetchOrderById = async (orderId) => {
        try {
          const res = await axios.get(`${API_URL}/api/orders/orderId/${orderId}`);
          setSelectedOrder(res.data);
          setIsModalOpen(true);
        } catch {
          setError("Không thể tải chi tiết đơn hàng");
        }
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
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
            // Gửi đánh giá
            for (const item of selectedOrder.orderItems) {
                await axios.post("http://localhost:8081/api/reviews", {
                    bookId: item.bookId,
                    accountId,
                    rating: ratings[item.bookId],
                    comment: comments[item.bookId],
                });
            }
            // Cập nhật trạng thái sang 'Đã nhận hàng'
            await axios.put(
                `${API_URL}/api/orders/update-shipping-status/${selectedOrder.orderId}?shippingStatus=Đã nhận hàng`
            );
            // Cập nhật UI
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
        setCancelReason("");
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
            await axios.post(`${API_URL}/api/cancelled-orders/request`, {
                orderId: selectedOrder.orderId,
                cancellationReason: cancelReason,
            });
            // Cập nhật UI
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

    // ====================================================================
    // RENDER
    // ====================================================================
    if (loading)
        return <div className="flex justify-center items-center h-screen">Đang tải...</div>;

    if (error && !orders.length)
        return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden !gap-4 !p-4 !ml-30">
            {/* Sidebar (cố định) */}
            <SideNavProfile selected={selectedTab} onSelect={setSelectedTab} />
            
            {/* Main content (Order) */}
            <div className="flex-1 overflow-y-auto max-w-[80%] mx-auto !mr-30">
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
                    
                    {/* Filter */}
                    <div className="overflow-x-auto mb-5">
                        <div className="flex gap-3">
                            {["Chờ xử lý", "Đã nhận đơn", "Đang giao", "Đã giao", "Đã nhận hàng", "Đã yêu cầu hủy", "Đã hủy"].map((status) => (
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
                    
                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                        <p className="text-center text-gray-500">Không có đơn hàng phù hợp</p>
                    ) : (
                        filteredOrders.map((order) => {
                            const total = order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
                            const isShipping = order.shippingStatus === "Đang giao";
                            
                            return (
                                <div key={order.orderId} className="bg-white p-4 rounded shadow-sm mb-4 border border-gray-200">
                                    <div onClick={() => fetchOrderById(order.orderId)} className="cursor-pointer">
                                        <h4 className="text-lg font-semibold mb-2 text-indigo-600">Đơn hàng #{order.orderId.substring(0, 8)}...</h4>
                                        <p className="text-sm text-gray-500 mb-2">Trạng thái: <span className="font-medium text-gray-800">{order.shippingStatus}</span></p>
                                        
                                        {order.orderItems.map((item) => (
                                            <div key={item.bookId} className="flex items-center gap-4 mb-2">
                                                <img src={item.bookImage} alt={item.bookName} className="w-12 h-12 rounded object-cover" />
                                                <div className="flex-grow">
                                                    <p className="text-sm font-medium">{item.bookName}</p>
                                                    <small className="text-gray-500">
                                                        {item.price.toLocaleString("vi-VN")} VND x {item.quantity}
                                                    </small>
                                                </div>
                                                <p className="font-semibold text-right whitespace-nowrap">{(item.price * item.quantity).toLocaleString("vi-VN")} VND</p>
                                            </div>
                                        ))}
                                        <p className="text-right font-bold text-lg border-t pt-2 mt-2">Tổng cộng: {total.toLocaleString("vi-VN")} VND</p>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
                                        
                                        {/* Nút Theo dõi Shipper */}
                                        {isShipping && (
                                            <button
                                                onClick={() => handleRouteToCustomer(order)}
                                                // Vô hiệu hóa nếu đang loading vị trí shipper
                                                disabled={!shipperLocation}
                                                className={`px-4 py-2 rounded font-medium transition ${
                                                    !shipperLocation
                                                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                }`}
                                            >
                                                {shipperLocation ? "🚚 Theo dõi Shipper" : "⏳ Đang lấy vị trí Shipper..."}
                                            </button>
                                        )}
                                        
                                        {order.shippingStatus === "Chờ xử lý" && (
                                            <button
                                                onClick={() => handleCancelOpen(order)}
                                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                            >
                                                Hủy đơn hàng
                                            </button>
                                        )}
                                        {order.shippingStatus === "Đã giao" && (
                                            <button
                                                onClick={() => handleRatingOpen(order)}
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                            >
                                                ✅ Đã Nhận được hàng
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            
                {/* ======================= MODALS ======================= */}

                {/* Order Details Modal */}
                {isModalOpen && selectedOrder && (
                    <div className="fixed z-50 inset-0 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                            {/* Modal content... */}
                            <span
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                                onClick={handleCloseModal}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết đơn hàng #{selectedOrder.orderId}</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Mã đơn hàng:</strong> {selectedOrder.orderId}</p>
                                <p><strong>Người nhận:</strong> {selectedOrder.recipientName}</p>
                                <p><strong>Số điện thoại:</strong> {selectedOrder.phoneNumber}</p>
                                <p><strong>Địa chỉ:</strong> {[selectedOrder.address, selectedOrder.ward, selectedOrder.district, selectedOrder.city].filter(Boolean).join(", ")}</p>
                                <p><strong>Tổng tiền:</strong> {selectedOrder.totalPrice.toLocaleString("vi-VN")} VND</p>
                                <p><strong>Trạng thái giao hàng:</strong> <span className="font-bold text-blue-600">{selectedOrder.shippingStatus}</span></p>
                                <p><strong>Ngày đặt hàng:</strong> {new Date(selectedOrder.dateOrder).toLocaleString()}</p>
                            </div>
                            <h4 className="text-md font-semibold text-gray-900 mt-4 mb-2 border-t pt-2">Sản phẩm:</h4>
                            <ul>
                                {selectedOrder.orderItems?.map((item, idx) => (
                                    <li key={idx} className="flex items-center py-2 border-b last:border-b-0">
                                        <div className="w-10 h-10 mr-3 shrink-0"><img src={item.bookImage} alt={item.bookName} className="w-full h-full object-cover rounded"/></div>
                                        <div className="flex-grow">
                                            <p className="text-sm text-gray-800">{item.bookName}</p>
                                            <p className="text-xs text-gray-600">{item.price.toLocaleString("vi-VN")} VND x{item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-800">{(item.quantity * item.price).toLocaleString("vi-VN")} VND</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            
                {/* Rating Modal */}
                {showRatingModal && selectedOrder && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4">
                        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Đánh giá đơn hàng #{selectedOrder.orderId}</h3>
                            {selectedOrder.orderItems.map((item) => (
                                <div key={item.bookId} className="mb-4 p-3 border rounded-lg bg-gray-50">
                                    <p className="font-medium text-gray-800 mb-2">{item.bookName}</p>
                                    <label className="flex items-center text-sm mb-2">
                                        Số sao:
                                        <select
                                            value={ratings[item.bookId]}
                                            onChange={(e) => handleRatingChange(item.bookId, e.target.value)}
                                            className="ml-2 border rounded p-1 text-sm bg-white"
                                        >
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <option key={star} value={star}>
                                                    {star} ⭐
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <textarea
                                        value={comments[item.bookId]}
                                        onChange={(e) => handleCommentChange(item.bookId, e.target.value)}
                                        className="w-full border mt-2 p-2 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        placeholder="Nhận xét của bạn về sản phẩm này..."
                                    />
                                </div>
                            ))}
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setShowRatingModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={submitReview}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
                                >
                                    Gửi Đánh giá
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            
                {/* Cancel Order Modal */}
                {showCancelModal && selectedOrder && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4">
                        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4 text-red-600">Hủy đơn hàng #{selectedOrder.orderId}</h3>
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
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-medium"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={submitCancellation}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
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