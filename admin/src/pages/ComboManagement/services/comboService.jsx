import axios from "axios";

// Đảm bảo port đúng với backend của bạn
const API_BASE = "http://localhost:8082/api/admin/combos";

export const getCombos = async (page, size) => {
  return axios.get(`${API_BASE}?page=${page}&size=${size}`);
};

export const getComboById = async (comboId) => {
  return axios.get(`${API_BASE}/${comboId}`);
};

export const getAllBookDetails = async () => {
  return axios.get("http://localhost:8081/api/book/all-details");
}

/**
 * Gửi object JSON bình thường (không phải FormData nữa)
 * Object này đã có field 'image' là URL string
 */
export const createCombo = async (comboData) => {
  return axios.post(API_BASE, comboData);
};

export const updateCombo = async (comboId, comboData) => {
  return axios.put(`${API_BASE}/${comboId}`, comboData);
};

export const deleteCombo = async (comboId) => {
  return axios.delete(`${API_BASE}/${comboId}`);
};