import axios from "axios";

// 1. SỬA: Đưa về gốc server, không trỏ vào cụ thể controller nào
const API_BASE = "http://localhost:8081"; 

// --- CÁC HÀM GỌI API ---

// API Xem trước (Preview)
export const previewExcel = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    // Kết quả: http://localhost:8081/api/imports/preview
    return axios.post(`${API_BASE}/api/imports/preview`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// API Xác nhận nhập (Confirm)
export const confirmImport = async (data) => {
    // Kết quả: http://localhost:8081/api/imports/confirm-import
    return axios.post(`${API_BASE}/api/imports/confirm-import`, data);
};

// API Nhập thủ công (Dùng chung với confirmImport hoặc endpoint riêng tùy backend)
export const importStock = async (books) => {
    // Nếu bạn muốn dùng endpoint cũ của BookController thì dùng: `${API_BASE}/api/book/import-stock`
    // Nhưng mình khuyên dùng cái mới ở ImportController luôn cho đồng bộ:
    return axios.post(`${API_BASE}/api/imports/confirm-import`, { newBooks: books });
};

// API Import Excel cũ (Nếu vẫn còn dùng ở chỗ khác)
export const importBooksFromExcel = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${API_BASE}/api/imports/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// API Lấy danh sách sách có sẵn (để chọn sách cũ)
export const getAvailableBooks = async (page, size) => {
    return axios.get(`${API_BASE}/api/book?page=${page}&size=${size}`);
};