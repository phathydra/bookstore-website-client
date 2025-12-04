import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Giả định bạn đã tạo component ShipperHeader hoặc Header dùng chung
// Nếu bạn dùng chung với DeliveryUnitInfo, hãy đổi tên import dưới đây
import ShipperHeader from "../ShipperHeader"; // Thay đổi đường dẫn này cho phù hợp

// ====================================================================
// HẰNG SỐ CHUNG
// ====================================================================
const SHIPPING_STATUS_SHIPPING = "Đang giao";
const SHIPPING_STATUS_DELIVERED = "Đã giao";
const API_URL = "http://localhost:8082"; // API Server cho đơn hàng (Orders)
const MAP_API_URL = "http://localhost:8084"; // API Server cho Map / Shipping
// ====================================================================

// ====================================================================
// COMPONENT: StatusChip
// ====================================================================
const StatusChip = ({ status }) => {
    let colorClass = "";
    let text = status;

    switch (status) {
        case SHIPPING_STATUS_SHIPPING:
            colorClass = "bg-blue-100 text-blue-800 border-blue-300";
            text = "Đang giao";
            break;
        case SHIPPING_STATUS_DELIVERED:
            colorClass = "bg-green-100 text-green-800 border-green-300";
            text = "Đã giao";
            break;
        default:
            colorClass = "bg-gray-100 text-gray-800 border-gray-300";
            text = status || "Không rõ";
    }

    return (
        <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${colorClass}`}
        >
            {text}
        </span>
    );
};

// ====================================================================
// COMPONENT: SHIPPER DASHBOARD
// ====================================================================

const ShipperDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [routeLoadingId, setRouteLoadingId] = useState(null);
    const [confirmLoadingId, setConfirmLoadingId] = useState(null);

    // Phân trang
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const shipperId = localStorage.getItem("accountId");

    // ====================================================================
    // useEffect: Kiểm tra vai trò và Tải danh sách đơn hàng
    // ====================================================================
    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "Shipper") {
            navigate("/"); // Chuyển hướng nếu không phải Shipper
        } else {
            // Chỉ tải đơn hàng nếu có shipperId
            if (shipperId) {
                fetchOrders(page);
            } else {
                 setApiError("Không tìm thấy ID Shipper. Vui lòng đăng nhập lại.");
                 setLoading(false);
            }
        }
    }, [navigate, page, shipperId]);

    // Hàm tải đơn hàng
    const fetchOrders = async (pageNumber = 0) => {
        if (!shipperId) return; // Bảo đảm có ID trước khi gọi API
        setLoading(true);
        setApiError(null);
        try {
            const response = await axios.get(
                `${API_URL}/api/orders/shipper/${shipperId}?page=${pageNumber}&size=${size}`
            );
            const { content, totalPages, totalElements } = response.data;
            setOrders(content || []);
            setTotalPages(totalPages);
            setTotalElements(totalElements);
            // Đặt lại trang về 0 nếu dữ liệu mới trống và page hiện tại > 0 (tránh bị kẹt)
            if (pageNumber > 0 && (!content || content.length === 0) && totalPages > 0) {
                setPage(0);
            }
        } catch (error) {
            console.error("Lỗi khi lấy đơn hàng:", error);
            const errorMessage = error.response?.data?.message || "Không thể tải đơn hàng. Kiểm tra lại server.";
            setApiError(errorMessage);
            setOrders([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    // Hàm chung để lấy vị trí hiện tại của Shipper
    const getCurrentPosition = () => {
        if (!navigator.geolocation) {
            return Promise.reject(new Error("Thiết bị không hỗ trợ định vị (Geolocation)."));
        }
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            });
        });
    };

    // ====================================================================
    // 🚀 Auto cập nhật vị trí Shipper mỗi 5 phút (300000ms)
    // ====================================================================
    useEffect(() => {
        if (!shipperId) return;

        let intervalId;

        const updateLocation = async () => {
            try {
                const position = await getCurrentPosition();
                const currentLon = position.coords.longitude;
                const currentLat = position.coords.latitude;

                await axios.put(
                    `${MAP_API_URL}/api/shippers/${shipperId}/location`,
                    null,
                    {
                        params: {
                            latitude: currentLat,
                            longitude: currentLon,
                        },
                    }
                );
            } catch (err) {
                if (err.message && !err.message.includes("Timeout")) {
                    console.error("❌ Lỗi khi cập nhật vị trí:", err.message);
                }
            }
        };

        updateLocation();
        intervalId = setInterval(updateLocation, 300000);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [shipperId]);

    // ====================================================================
    // ✅ HÀM 1: ĐƯỜNG ĐẾN KHO (Delivery Unit)
    // ====================================================================
    const handleRouteToDeliveryUnit = async (deliveryUnitId, orderId) => {
        setRouteLoadingId(orderId);
        setApiError(null);

        try {
            const position = await getCurrentPosition();
            const currentLon = position.coords.longitude;
            const currentLat = position.coords.latitude;

            const addressResponse = await axios.get(
                `${MAP_API_URL}/api/shipping/delivery-units/${deliveryUnitId}/address`
            );
            const destinationAddress = addressResponse.data;

            if (!destinationAddress || destinationAddress.trim() === "") {
                throw new Error(`Không tìm thấy địa chỉ cho Kho ID: ${deliveryUnitId}`);
            }

            const routeResponse = await axios.get(
                `${MAP_API_URL}/api/map/route/to-delivery-unit`,
                {
                    params: {
                        currentLon: currentLon,
                        currentLat: currentLat,
                        deliveryUnitId: deliveryUnitId,
                    },
                }
            );

            const routeData = routeResponse.data;

            if (routeData.errorMessage || !routeData.routes || routeData.routes.length === 0) {
                throw new Error(
                    `Lỗi tính toán đường đi: ${routeData.errorMessage || "Không tìm thấy tuyến đường."}`
                );
            }

            navigate("/map-view", {
                state: {
                    routeData: routeData,
                    origin: { lon: currentLon, lat: currentLat },
                    destinationAddress: `KHO: ${destinationAddress}`,
                    originAddress: "Vị trí hiện tại của bạn (Shipper)",
                },
            });
        } catch (error) {
            console.error("Lỗi khi tính toán tuyến đường đến Kho:", error);
            const message =
                error.code === 1
                    ? "Bạn cần cấp quyền truy cập vị trí để dùng tính năng này."
                    : error.message.includes("Không hỗ trợ định vị")
                    ? error.message
                    : error.response?.data?.errorMessage
                    ? `Lỗi Backend: ${error.response.data.errorMessage}`
                    : "Đã xảy ra lỗi hệ thống khi tính toán đường đi đến Kho.";
            setApiError(message);
        } finally {
            setRouteLoadingId(null);
        }
    };

    // ====================================================================
    // ✅ HÀM 2: ĐƯỜNG SHIP (Khách hàng)
    // ====================================================================
    const handleRouteToCustomer = async (order, orderId) => {
        setRouteLoadingId(orderId);
        setApiError(null);

        try {
            const position = await getCurrentPosition();
            const currentLon = position.coords.longitude;
            const currentLat = position.coords.latitude;

            const customerAddressDisplay = `${order.note || ""}, ${order.address || ""}, ${order.ward || ""}, ${order.district || ""}, ${order.city || ""}`
                .replace(/,(\s*,){1,}/g, ",")
                .replace(/,$/g, "")
                .trim();

            const routeResponse = await axios.get(
                `${MAP_API_URL}/api/map/route/to-customer-address`,
                {
                    params: {
                        currentLon: currentLon,
                        currentLat: currentLat,
                        orderId: orderId,
                    },
                }
            );

            const routeData = routeResponse.data;

            if (routeData.errorMessage || !routeData.routes || routeData.routes.length === 0) {
                throw new Error(
                    `Lỗi tính toán đường đi: ${routeData.errorMessage || "Không tìm thấy tuyến đường."}`
                );
            }

            navigate("/map-view", {
                state: {
                    routeData: routeData,
                    origin: { lon: currentLon, lat: currentLat },
                    destinationAddress: `KHÁCH HÀNG: ${customerAddressDisplay}`,
                    originAddress: "Vị trí hiện tại của bạn (Shipper)",
                },
            });
        } catch (error) {
            console.error("Lỗi khi tính toán tuyến đường đến Khách hàng:", error);
            const message =
                error.code === 1
                    ? "Bạn cần cấp quyền truy cập vị trí để dùng tính năng này."
                    : error.message.includes("Không hỗ trợ định vị")
                    ? error.message
                    : error.response?.data?.errorMessage
                    ? `Lỗi Backend: ${error.response.data.errorMessage}`
                    : "Đã xảy ra lỗi hệ thống khi tính toán đường đi đến Khách hàng.";
            setApiError(message);
        } finally {
            setRouteLoadingId(null);
        }
    };

    // ====================================================================
    // ✅ HÀM 3: XÁC NHẬN ĐÃ GIAO
    // ====================================================================
    const handleConfirmDelivery = async (orderId) => {
        if (window.confirm("Bạn có chắc chắn muốn xác nhận đơn hàng này đã giao thành công?")) {
            setConfirmLoadingId(orderId);
            setApiError(null);

            try {
                // Gọi API cập nhật trạng thái đơn hàng thành "Đã giao thành công"
                await axios.put(
                    `${API_URL}/api/orders/update-shipping-status/${orderId}`,
                    null,
                    {
                        params: { shippingStatus: SHIPPING_STATUS_DELIVERED },
                    }
                );

                alert(`✅ Đơn hàng ${orderId.substring(0, 8)}... đã được cập nhật thành 'Đã giao thành công'!`);
                fetchOrders(page);
            } catch (error) {
                console.error("Lỗi khi xác nhận đơn hàng:", error);
                const errorMessage =
                    error.response?.data?.message || "Lỗi khi xác nhận đơn hàng. Vui lòng thử lại.";
                setApiError(errorMessage);
            } finally {
                setConfirmLoadingId(null);
            }
        }
    };

    // ====================================================================
    // RENDER
    // ====================================================================

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <ShipperHeader shipperId={shipperId} />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    📦 Bảng Điều Khiển Shipper
                </h2>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Danh sách đơn hàng của tôi
                </h3>

                {loading && (
                    <div className="text-center p-8 bg-white rounded-xl shadow">
                        <p className="text-lg text-indigo-500">Đang tải đơn hàng...</p>
                    </div>
                )}

                {apiError && (
                    <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded mb-6">
                        🚨 Lỗi: {apiError}
                    </div>
                )}

                {!loading && orders.length === 0 && !apiError && (
                    <div className="text-center p-8 bg-white rounded-xl shadow">
                        <p className="text-lg text-gray-500">
                            Bạn chưa có đơn hàng nào được giao. Vui lòng chờ đơn hàng mới!
                        </p>
                    </div>
                )}

                {!loading && orders.length > 0 && (
                    <div className="bg-white shadow rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            "Mã ĐH",
                                            "Người nhận",
                                            "SĐT",
                                            "Địa chỉ",
                                            "Mã ĐVVC",
                                            "Trạng thái",
                                            "Tổng tiền",
                                            "Hành động",
                                        ].map((header, i) => (
                                            <th
                                                key={i}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => {
                                        const fullAddress = `${order.note || ""}, ${order.address || ""}, ${order.ward || ""}, ${order.district || ""}, ${order.city || ""}`.replace(/,(\s*,){1,}/g, ", ").replace(/, $/, "").trim();
                                        const deliveryUnitId = order.deliveryUnitId;
                                        const isRouteLoading = routeLoadingId === order.orderId;
                                        const isConfirmLoading = confirmLoadingId === order.orderId;
                                        const isShipping = order.shippingStatus === SHIPPING_STATUS_SHIPPING;

                                        return (
                                            <tr
                                                key={order.orderId}
                                                className="transition duration-150 hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 text-sm text-indigo-600 font-mono">
                                                    {order.orderId.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {order.recipientName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {order.phoneNumber}
                                                </td>
                                                <td
                                                    className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs"
                                                    title={fullAddress}
                                                >
                                                    {fullAddress}
                                                </td>
                                                <td
                                                    className="px-6 py-4 text-sm text-gray-700 font-mono"
                                                    title={deliveryUnitId}
                                                >
                                                    {deliveryUnitId.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <StatusChip status={order.shippingStatus} />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                                                    {order.totalPrice ? order.totalPrice.toLocaleString("vi-VN") : '0'} VND
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {isShipping && (
                                                        <div className="flex flex-col space-y-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleRouteToDeliveryUnit(
                                                                        deliveryUnitId,
                                                                        order.orderId
                                                                    )
                                                                }
                                                                disabled={isRouteLoading || isConfirmLoading}
                                                                className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
                                                            >
                                                                {isRouteLoading &&
                                                                routeLoadingId === order.orderId ? (
                                                                    <>
                                                                        <svg
                                                                            className="animate-spin h-4 w-4 mr-1 text-white"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <circle
                                                                                className="opacity-25"
                                                                                cx="12"
                                                                                cy="12"
                                                                                r="10"
                                                                                stroke="currentColor"
                                                                                strokeWidth="4"
                                                                            ></circle>
                                                                            <path
                                                                                className="opacity-75"
                                                                                fill="currentColor"
                                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                            ></path>
                                                                        </svg>
                                                                        Đang dò Kho...
                                                                    </>
                                                                ) : (
                                                                    "Đường đến Kho 🚚"
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleRouteToCustomer(
                                                                        order,
                                                                        order.orderId
                                                                    )
                                                                }
                                                                disabled={isRouteLoading || isConfirmLoading}
                                                                className="px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
                                                            >
                                                                {isRouteLoading &&
                                                                routeLoadingId === order.orderId ? (
                                                                    <>
                                                                        <svg
                                                                            className="animate-spin h-4 w-4 mr-1 text-white"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <circle
                                                                                className="opacity-25"
                                                                                cx="12"
                                                                                cy="12"
                                                                                r="10"
                                                                                stroke="currentColor"
                                                                                strokeWidth="4"
                                                                            ></circle>
                                                                            <path
                                                                                className="opacity-75"
                                                                                fill="currentColor"
                                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                            ></path>
                                                                        </svg>
                                                                        Đang dò Ship...
                                                                    </>
                                                                ) : (
                                                                    "Đường Ship (Khách hàng) 📍"
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleConfirmDelivery(order.orderId)
                                                                }
                                                                disabled={isRouteLoading || isConfirmLoading}
                                                                className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
                                                            >
                                                                {isConfirmLoading ? (
                                                                    <>
                                                                        <svg
                                                                            className="animate-spin h-4 w-4 mr-1 text-white"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <circle
                                                                                className="opacity-25"
                                                                                cx="12"
                                                                                cy="12"
                                                                                r="10"
                                                                                stroke="currentColor"
                                                                                strokeWidth="4"
                                                                            ></circle>
                                                                            <path
                                                                                className="opacity-75"
                                                                                fill="currentColor"
                                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                            ></path>
                                                                        </svg>
                                                                        Đang xác nhận...
                                                                    </>
                                                                ) : (
                                                                    "Xác nhận Đã giao ✅"
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 0 && (
                            <div className="flex justify-between items-center p-4 border-t border-gray-200">
                                <span className="text-sm text-gray-600">
                                    Tổng số đơn: <span className="font-semibold">{totalElements}</span>
                                </span>
                                <div className="space-x-2">
                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition text-sm"
                                    >
                                        Trang trước
                                    </button>
                                    <button
                                        disabled={page >= totalPages - 1}
                                        onClick={() => setPage((prev) => prev + 1)}
                                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition text-sm"
                                    >
                                        Trang sau
                                    </button>
                                </div>
                                <span className="text-sm text-gray-600">
                                    Trang <span className="font-semibold">{page + 1}</span>/
                                    <span className="font-semibold">{totalPages}</span>
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ShipperDashboard;
