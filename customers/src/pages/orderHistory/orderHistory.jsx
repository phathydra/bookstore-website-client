import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideNavProfile from '../Profile/SideNavProfile';

// ====================================================================
// HẰNG SỐ CHUNG
// ====================================================================
const API_URL = "http://localhost:8082"; // API Orders
const MAP_API_URL = "http://localhost:8084"; // API Map / Shipping
const REVIEW_API_URL = "http://localhost:8081"; // API Review (Tách riêng để dễ quản lý)
const SHIPPER_LOCATION_INTERVAL = 10000; // 10 giây

// ====================================================================
// COMPONENT CHÍNH
// ====================================================================
const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState("Chờ xử lý");
    
    // State cho Modal Đánh giá
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});

    // State cho Modal Hủy
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('orders');
    
    // State shipper
    const [shipperLocation, setShipperLocation] = useState(null);
    const locationIntervalRef = useRef(null);

    const accountId = localStorage.getItem("accountId");

    // ... (Giữ nguyên logic Shipper Location và Fetch Orders như cũ) ...
    // ====================================================================
    // LOGIC CẬP NHẬT/CLEANUP VỊ TRÍ SHIPPER
    // ====================================================================
    const fetchShipperLocation = async (shipperId) => {
        if (!shipperId) return;
        try {
            const { data } = await axios.get(`${MAP_API_URL}/api/shippers/${shipperId}/location`);
            setShipperLocation(data);
        } catch (err) {
            console.error(`❌ Lỗi lấy vị trí shipper ${shipperId}:`, err.message);
        }
    };

    useEffect(() => {
        const orderInShipping = orders.find(o => o.shippingStatus === "Đang giao" && o.shipperId);
        if (orderInShipping) {
            fetchShipperLocation(orderInShipping.shipperId);
            if (!locationIntervalRef.current) {
                locationIntervalRef.current = setInterval(() => {
                    fetchShipperLocation(orderInShipping.shipperId);
                }, SHIPPER_LOCATION_INTERVAL); 
            }
        } else {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
                locationIntervalRef.current = null;
            }
            setShipperLocation(null);
        }
        return () => {
            if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
        };
    }, [orders]);

    useEffect(() => {
        if (!accountId) {
            setError("Không tìm thấy tài khoản");
            setLoading(false);
            return;
        }
        axios.get(`${API_URL}/api/orders/${accountId}`)
            .then((res) => {
                setOrders(res.data || []);
                if (!res.data.length) setError("Không có đơn hàng nào");
            })
            .catch(() => setError("Lỗi khi tải đơn hàng"))
            .finally(() => setLoading(false));
    }, [accountId]);

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
            const customerAddress = [order.address, order.ward, order.district, order.city].filter(Boolean).join(", ");
            let params = { 
                currentLon: shipperLocation.longitude, 
                currentLat: shipperLocation.latitude,
                orderId: order.orderId 
            };
            const { data } = await axios.get(`${MAP_API_URL}/api/map/route/to-customer-address`, { params });

            if (!data.routes?.length) throw new Error("Không tìm thấy tuyến đường.");

            navigate("/map-view", {
                state: {
                    routeData: data,
                    origin: { lon: shipperLocation.longitude, lat: shipperLocation.latitude },
                    originAddress: `Vị trí hiện tại của Shipper`,
                    destinationAddress: `ĐỊA CHỈ NHẬN HÀNG: ${customerAddress}`,
                },
            });
        } catch (err) {
            alert(err.message || "Lỗi khi tính toán tuyến đường.");
        }
    };

    // ====================================================================
    // XỬ LÝ LOGIC ĐÁNH GIÁ & XÁC NHẬN (ĐÃ SỬA ĐỔI)
    // ====================================================================
    
    // Mở modal đánh giá
    const handleRatingOpen = (order) => {
        const rate = {}, comment = {};
        // Mặc định 5 sao cho đẹp
        order.orderItems.forEach((item) => {
          rate[item.bookId] = 5; 
          comment[item.bookId] = "";
        });
        setRatings(rate);
        setComments(comment);
        setSelectedOrder(order);
        setShowRatingModal(true);
    };

    // Hàm cập nhật trạng thái đơn hàng (Dùng chung)
    const updateOrderStatusToReceived = async (orderId) => {
        await axios.put(
            `${API_URL}/api/orders/update-shipping-status/${orderId}?shippingStatus=Đã nhận hàng`
        );
        // Cập nhật UI
        setOrders(orders.map((o) =>
            o.orderId === orderId ? { ...o, shippingStatus: "Đã nhận hàng" } : o
        ));
    };

    // 1. Chỉ xác nhận đã nhận (BỎ QUA ĐÁNH GIÁ)
    const handleSkipReviewAndConfirm = async () => {
        if (!selectedOrder) return;
        if (!window.confirm("Bạn có chắc muốn xác nhận đã nhận hàng mà không đánh giá?")) return;

        try {
            await updateOrderStatusToReceived(selectedOrder.orderId);
            alert("Đã xác nhận nhận hàng thành công!");
            setShowRatingModal(false);
        } catch (error) {
            console.error("Lỗi xác nhận:", error);
            alert("Lỗi khi xác nhận đơn hàng.");
        }
    };

    // 2. Gửi đánh giá VÀ Xác nhận
    const submitReview = async () => {
        if (!selectedOrder) return;
        try {
            // Gửi đánh giá cho từng sản phẩm
            const reviewPromises = selectedOrder.orderItems.map(item => 
                axios.post(`${REVIEW_API_URL}/api/reviews`, {
                    bookId: item.bookId,
                    accountId,
                    rating: ratings[item.bookId],
                    comment: comments[item.bookId],
                })
            );
            
            await Promise.all(reviewPromises);

            // Sau khi đánh giá xong, cập nhật trạng thái đơn hàng
            await updateOrderStatusToReceived(selectedOrder.orderId);

            alert("Cảm ơn bạn đã đánh giá!");
            setShowRatingModal(false);
        } catch {
            setError("Lỗi khi gửi đánh giá");
        }
    };

    // Helper render ngôi sao
    const renderStars = (bookId, currentRating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRatings(prev => ({ ...prev, [bookId]: star }))}
                        className={`text-2xl transition-transform hover:scale-110 focus:outline-none ${
                            star <= currentRating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        title={`${star} sao`}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    // ====================================================================
    // CÁC HÀM XỬ LÝ KHÁC (Hủy, Xem chi tiết...)
    // ====================================================================
    const fetchOrderById = async (orderId) => {
        try {
          const res = await axios.get(`${API_URL}/api/orders/orderId/${orderId}`);
          setSelectedOrder(res.data);
          setIsModalOpen(true);
        } catch { setError("Không thể tải chi tiết đơn hàng"); }
    };
    
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedOrder(null); };

    const handleCommentChange = (bookId, value) => setComments((c) => ({ ...c, [bookId]: value }));

    const handleCancelOpen = (order) => { setSelectedOrder(order); setShowCancelModal(true); setCancelReason(""); };
    const handleCancelReasonChange = (e) => setCancelReason(e.target.value);

    const submitCancellation = async () => {
        if (!selectedOrder || !cancelReason.trim()) { alert("Vui lòng nhập lý do."); return; }
        try {
            await axios.post(`${API_URL}/api/cancelled-orders/request`, {
                orderId: selectedOrder.orderId, cancellationReason: cancelReason,
            });
            setOrders(orders.map((o) => o.orderId === selectedOrder.orderId ? { ...o, shippingStatus: "Đã yêu cầu hủy" } : o));
            alert("Đã gửi yêu cầu hủy."); setShowCancelModal(false);
        } catch { setError("Lỗi hủy đơn hàng"); }
    };

    const filteredOrders = orders.filter((o) => o.shippingStatus === filter);

    // ====================================================================
    // RENDER
    // ====================================================================
    if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden !gap-4 !p-4 !ml-30">
            <SideNavProfile selected={selectedTab} onSelect={setSelectedTab} />
            
            <div className="flex-1 overflow-y-auto max-w-[80%] mx-auto !mr-30">
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-4">Lịch sử đơn hàng</h2>
                    
                    {/* Filter Tabs */}
                    <div className="overflow-x-auto mb-5 pb-2">
                        <div className="flex gap-3">
                            {["Chờ xử lý", "Đã nhận đơn", "Đang giao", "Đã giao", "Đã nhận hàng", "Đã yêu cầu hủy", "Đã hủy"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 !rounded-xl font-semibold transition whitespace-nowrap text-sm ${
                                        filter === status ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                            <p>Không có đơn hàng ở trạng thái này</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const total = order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
                            
                            return (
                                <div key={order.orderId} className="bg-white p-5 rounded-lg shadow-sm mb-4 border border-gray-100 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-3 border-b pb-2">
                                        <div>
                                            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded uppercase tracking-wide">
                                                #{order.orderId.substring(0, 8)}
                                            </span>
                                            <span className="ml-3 text-sm text-gray-500">{new Date(order.dateOrder).toLocaleString()}</span>
                                        </div>
                                        <div className="font-semibold text-sm text-blue-600">{order.shippingStatus}</div>
                                    </div>

                                    <div onClick={() => fetchOrderById(order.orderId)} className="cursor-pointer space-y-3">
                                        {order.orderItems.map((item) => (
                                            <div key={item.bookId} className="flex items-center gap-4">
                                                <img src={item.bookImage} alt={item.bookName} className="w-16 h-16 rounded-md object-cover border" />
                                                <div className="flex-grow">
                                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.bookName}</p>
                                                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-semibold">{(item.price * item.quantity).toLocaleString("vi-VN")} đ</p>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                                        <div className="text-sm text-gray-600">Tổng tiền: <span className="text-lg font-bold text-gray-900">{total.toLocaleString("vi-VN")} đ</span></div>
                                        
                                        <div className="flex gap-2">
                                            {order.shippingStatus === "Đang giao" && (
                                                <button
                                                    onClick={() => handleRouteToCustomer(order)}
                                                    disabled={!shipperLocation}
                                                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition flex items-center gap-1 ${
                                                        !shipperLocation
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                                    }`}
                                                >
                                                    {shipperLocation ? "🚚 Theo dõi Shipper" : "⏳ Đợi vị trí..."}
                                                </button>
                                            )}
                                            
                                            {order.shippingStatus === "Chờ xử lý" && (
                                                <button onClick={() => handleCancelOpen(order)} className="px-3 py-1.5 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50">Hủy đơn</button>
                                            )}
                                            
                                            {/* Nút Đã giao -> Kích hoạt Modal Đánh giá/Xác nhận */}
                                            {order.shippingStatus === "Đã giao" && (
                                                <button
                                                    onClick={() => handleRatingOpen(order)}
                                                    className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-medium"
                                                >
                                                    Đã nhận hàng & Đánh giá
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            
                {/* ======================= CHI TIẾT ĐƠN HÀNG MODAL ======================= */}
                {isModalOpen && selectedOrder && (
                    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Chi tiết đơn hàng</h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            {/* Nội dung chi tiết (giữ nguyên hoặc style lại tùy ý) */}
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>Mã: <span className="text-black font-medium">{selectedOrder.orderId}</span></p>
                                <p>Địa chỉ: <span className="text-black">{[selectedOrder.address, selectedOrder.ward, selectedOrder.district, selectedOrder.city].filter(Boolean).join(", ")}</span></p>
                            </div>
                            <div className="mt-4 max-h-60 overflow-y-auto pr-1">
                                {selectedOrder.orderItems?.map((item, idx) => (
                                    <div key={idx} className="flex py-3 border-b last:border-0">
                                        <img src={item.bookImage} className="w-12 h-12 rounded object-cover mr-3"/>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{item.bookName}</p>
                                            <p className="text-xs text-gray-500">{item.price.toLocaleString("vi-VN")} đ x {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-bold">{(item.quantity * item.price).toLocaleString("vi-VN")} đ</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            
                {/* ======================= RATING MODAL (ĐÃ SỬA ĐỔI) ======================= */}
                {showRatingModal && selectedOrder && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Đánh giá sản phẩm</h3>
                                    <p className="text-sm text-gray-500">Đơn hàng #{selectedOrder.orderId.substring(0,8)}</p>
                                </div>
                                <button onClick={() => setShowRatingModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                            </div>

                            {/* Body (Scrollable) */}
                            <div className="p-6 overflow-y-auto flex-1">
                                {selectedOrder.orderItems.map((item) => (
                                    <div key={item.bookId} className="flex gap-4 mb-6 pb-6 border-b last:border-0 last:pb-0 last:mb-0">
                                        {/* Cột trái: Ảnh sản phẩm */}
                                        <div className="w-20 shrink-0">
                                            <img src={item.bookImage} alt={item.bookName} className="w-full h-24 object-cover rounded-md border shadow-sm"/>
                                        </div>
                                        
                                        {/* Cột phải: Form đánh giá */}
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-900 mb-2">{item.bookName}</p>
                                            
                                            {/* Render Stars */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-sm text-gray-500">Chất lượng:</span>
                                                {renderStars(item.bookId, ratings[item.bookId])}
                                                <span className="text-sm font-medium text-yellow-600 ml-2">
                                                    {ratings[item.bookId] === 5 ? "Tuyệt vời" : ratings[item.bookId] === 4 ? "Hài lòng" : ratings[item.bookId] === 3 ? "Bình thường" : "Tệ"}
                                                </span>
                                            </div>

                                            <textarea
                                                value={comments[item.bookId]}
                                                onChange={(e) => handleCommentChange(item.bookId, e.target.value)}
                                                className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                                rows="2"
                                                placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-5 border-t bg-gray-50 rounded-b-xl flex flex-col md:flex-row justify-end items-center gap-3">
                                <button
                                    onClick={() => setShowRatingModal(false)}
                                    className="w-full md:w-auto px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition"
                                >
                                    Đóng
                                </button>
                                
                                {/* Nút MỚI: Chỉ xác nhận */}
                                <button
                                    onClick={handleSkipReviewAndConfirm}
                                    className="w-full md:w-auto px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg font-medium transition"
                                >
                                    Bỏ qua đánh giá
                                </button>

                                {/* Nút Gửi Đánh giá */}
                                <button
                                    onClick={submitReview}
                                    className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md font-medium transition transform active:scale-95"
                                >
                                    Gửi Đánh giá & Hoàn tất
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            
                {/* Cancel Modal (Giữ nguyên logic, chỉ chỉnh chút CSS nếu cần) */}
                {showCancelModal && selectedOrder && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
                        <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
                            <h3 className="text-lg font-bold mb-4 text-red-600">Hủy đơn hàng</h3>
                            <textarea
                                className="w-full border p-2 rounded mb-4"
                                rows="3"
                                placeholder="Nhập lý do hủy..."
                                value={cancelReason}
                                onChange={handleCancelReasonChange}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowCancelModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Đóng</button>
                                <button onClick={submitCancellation} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Xác nhận Hủy</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;