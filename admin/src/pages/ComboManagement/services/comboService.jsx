import axios from "axios";

// API này trỏ đến 'orders' service (port 8082 của bạn)
const API_BASE = "http://localhost:8082/api/admin/combos";

/**
 * Lấy tất cả combos (Giả định backend hỗ trợ paged)
 */
export const getCombos = async (page, size) => {
  return axios.get(`${API_BASE}?page=${page}&size=${size}`);
};

/**
 * Lấy chi tiết tất cả sách (từ 'books' service)
 * Dùng cho ô tìm kiếm sách khi tạo/sửa combo
 * API này trỏ đến 'books' service (port 8081)
 */
export const getAllBookDetails = async () => {
  return axios.get("http://localhost:8081/api/book/all-details");
}

/**
 * Tạo một combo mới
 */
export const createCombo = async (comboData) => {
  return axios.post(API_BASE, comboData);
};

/**
 * Xóa một combo
 */
export const deleteCombo = async (comboId) => {
  return axios.delete(`${API_BASE}/${comboId}`);
};

// ============================================
// ===== MỚI: THÊM HÀM UPDATE VÀ GET BY ID =====
// ============================================

/**
 * Lấy chi tiết một combo bằng ID
 */
export const getComboById = async (comboId) => {
  return axios.get(`${API_BASE}/${comboId}`);
};

/**
 * Cập nhật một combo hiện có
 */
export const updateCombo = async (comboId, comboData) => {
  return axios.put(`${API_BASE}/${comboId}`, comboData);
};