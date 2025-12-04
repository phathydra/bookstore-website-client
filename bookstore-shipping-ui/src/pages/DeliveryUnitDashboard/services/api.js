// src/pages/DeliveryUnitDashboard/services/api.js
import axios from 'axios';
import { API_URL, SHIPPING_API_URL, SHIPPING_STATUS_SHIPPING } from '../constants';

// --- API Service cho Orders (Port 8082) ---
const orderApi = axios.create({ baseURL: API_URL });

export const getOrders = (deliveryUnitId, page, size) => {
    return orderApi.get(`/api/orders/delivery-unit/${deliveryUnitId}`, { params: { page, size } });
};

// --- HÀM MỚI ĐỂ LẤY CHI TIẾT ĐƠN HÀNG ---
export const getOrderDetail = (orderId) => {
    return orderApi.get(`/api/orders/orderId/${orderId}`);
};
// ----------------------------------------

export const assignShipper = (orderId, shipperId) => {
    return orderApi.put(`/api/orders/assign-shipper/${orderId}`, null, { params: { shipperId } });
};

export const updateOrderStatus = (orderId, shippingStatus) => {
    return orderApi.put(`/api/orders/update-shipping-status/${orderId}`, null, { params: { shippingStatus } });
};

export const assignDeliveryUnit = (orderId, deliveryUnitId) => {
    return orderApi.put(`/api/orders/assign-delivery-unit/${orderId}`, null, { params: { deliveryUnitId } });
};

// --- API Service cho Shipping & Map (Port 8084) ---
const shippingApi = axios.create({ baseURL: SHIPPING_API_URL });

export const getShippers = (deliveryUnitId) => {
    return shippingApi.get(`/api/shipping/shippers`, { params: { deliveryUnitId } });
};

export const getOtherDeliveryUnits = (currentUnitId) => {
    // Giả định API này trả về tất cả, chúng ta sẽ lọc sau
    return shippingApi.get(`/api/shipping/delivery-units`);
};

export const getRouteForOrder = (deliveryUnitId, orderId) => {
    return shippingApi.get(`/api/map/route/optimized-to-customer`, {
        params: { deliveryUnitId, orderId }
    });
};

// --- THÊM MỚI (Phân cụm) ---
/**
 * Gửi danh sách đơn hàng lên backend để phân cụm
 * @param {Array<Object>} ordersToCluster - Mảng các object { orderId, address }
 * @param {Object} options - Tùy chọn { maxDistanceKm, minClusterSize }
 * @returns {Promise}
 */
export const postOrderClusters = (ordersToCluster, options = {}) => {
    const requestBody = {
        orders: ordersToCluster,
        maxDistanceKm: options.maxDistanceKm || 1.0,  // Bán kính cụm 1km
        minClusterSize: options.minClusterSize || 2    // Tối thiểu 2 đơn/cụm
    };
    return shippingApi.post(`/api/map/cluster-orders`, requestBody);
};

// --- ✅ THÊM MỚI (Tìm Shipper Gần) ---
/**
 * Tìm các shipper đang hoạt động gần một đơn vị vận chuyển (Hub).
 * @param {string} deliveryUnitId - ID của Hub (ĐVVC).
 * @param {number} maxRadiusKm - Bán kính tìm kiếm (km).
 * @returns {Promise<axios.Response<ShipInfor[]>>} - Danh sách ShipInfor
 */
export const findNearbyShippers = (deliveryUnitId, maxRadiusKm = 5) => {
    // Endpoint này dựa trên Controller bạn đã tạo: /api/shipping/nearby/{deliveryUnitId}
    return shippingApi.get(
      `/api/shipping/nearby/${deliveryUnitId}`,
      { params: { maxRadiusKm } }
    );
};
// -------------------------------------


// --- Hàm tổng hợp ---

/**
 * Gán shipper và cập nhật trạng thái cho nhiều đơn hàng
 */
export const assignShipperAndUpdateStatus = async (orderIds, shipperId) => {
    // 1. Gán shipper
    await Promise.all(
        orderIds.map(orderId => assignShipper(orderId, shipperId))
    );
    
    // 2. Cập nhật trạng thái
    await Promise.all(
        orderIds.map(orderId => updateOrderStatus(orderId, SHIPPING_STATUS_SHIPPING))
    );
};

/**
 * Chuyển giao nhiều đơn hàng cho ĐVVC mới
 */
export const transferOrdersToUnit = (orderIds, newUnitId) => {
    return Promise.all(
        orderIds.map(orderId => assignDeliveryUnit(orderId, newUnitId))
    );
};