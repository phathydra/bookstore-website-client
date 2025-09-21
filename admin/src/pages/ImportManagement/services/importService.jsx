import axios from "axios";

const API_BASE = "http://localhost:8081/api/book";

/**
 * Gửi yêu cầu nhập sách (nhập mới hoặc tăng số lượng sách cũ).
 * @param {Array<Object>} booksToImport Danh sách sách cần nhập
 * @returns Promise
 */
export const importStock = async (booksToImport) => {
  return axios.post(`${API_BASE}/import-stock`, { books: booksToImport });
};

/**
 * Gửi yêu cầu nhập sách từ file Excel.
 * @param {File} file File Excel chứa dữ liệu sách
 * @returns Promise
 */
export const importBooksFromExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${API_BASE}/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};