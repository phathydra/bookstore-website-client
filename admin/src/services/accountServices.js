import axios from "axios";

const API_URL = "http://localhost:8080/api/account"; // Backend URL

// Lấy danh sách tài khoản
export const getAllAccounts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách tài khoản:", error);
    return [];
  }
};

// Thêm tài khoản mới
export const createAccount = async (accountData) => {
  try {
    const response = await axios.post(`${API_URL}/create`, accountData);
    return response.data;
  } catch (error) {
    console.error("Lỗi thêm tài khoản:", error);
    return null;
  }
};

// Cập nhật tài khoản
export const updateAccount = async (accountId, accountData) => {
  try {
    const response = await axios.put(`${API_URL}/update?accountId=${accountId}`, accountData);
    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật tài khoản:", error);
    return null;
  }
};

// Xóa tài khoản
export const deleteAccount = async (accountId) => {
  try {
    await axios.delete(`${API_URL}/delete?accountId=${accountId}`);
    return true;
  } catch (error) {
    console.error("Lỗi xóa tài khoản:", error);
    return false;
  }
};
