import axios from 'axios';

const BASE_URL = 'http://localhost:8082/api';
const ANALYTICS_URL = 'http://localhost:8081/api/analytics';

export const getAvailableVouchers = (userId) => {
  return axios.get(`${BASE_URL}/vouchers/available-voucher?accountId=${userId}`);
};

export const getPersonalVouchers = (userId) => {
  return axios.get(`${BASE_URL}/vouchers/personal-voucher?accountId=${userId}`);
};

export const searchVoucherByCode = (code, isPersonal) => {
  const url = isPersonal 
    ? `${BASE_URL}/vouchers/personal?code=${code}` 
    : `${BASE_URL}/vouchers/get-voucher?code=${code}`;
  return axios.get(url);
};

export const createOrder = (orderData) => {
  return axios.post(`${BASE_URL}/orders/create`, orderData);
};

export const applyVoucherToOrder = (orderId, voucherCode, discountedPrice) => {
  return axios.post(`${BASE_URL}/vouchers/apply-voucher`, {
    orderId,
    voucherCode,
    discountedPrice,
  });
};

export const getObtainedVouchers = (orderId) => {
  return axios.get(`${BASE_URL}/vouchers/obtain?orderId=${orderId}`);
};


// ⭐️ (SỬA) Đổi tên/chỉ giữ lại hàm track order-success
export const trackOrderSuccess = (trackData) => {
  // trackData là object: { accountId, totalAmount, paymentMethod, voucherCode, bookIds }
  return axios.post(`${ANALYTICS_URL}/track/order-success`, trackData);
};