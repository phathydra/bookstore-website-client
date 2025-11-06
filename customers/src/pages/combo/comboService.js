// Giả sử bạn có 1 file cấu hình axios chung
// Nếu không, hãy import axios trực tiếp
import axios from 'axios'; 

// Cấu hình base URL cho API của bạn (ví dụ)
const api = axios.create({
  baseURL: 'http://localhost:8082', // Đây là cổng service 'orders' của bạn
});

/**
 * HÀM MỚI: Lấy các combo đang active cho trang Home
 * (Bạn cần tạo API này ở backend, ví dụ: GET /api/combos/active)
 */
export const getActiveCombos = () => {
  // Đường dẫn API này là ví dụ, bạn hãy thay bằng API public của bạn
  return api.get('/api/admin/combos/active'); 
};

// Thêm các hàm service khác cho khách hàng ở đây (nếu cần)
export const getComboById = (comboId) => {
  // GET /api/public/combos/{comboId}
  return api.get(`/api/admin/combos/${comboId}`);
};