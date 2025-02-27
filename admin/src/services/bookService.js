import axios from "axios";

const API_URL = "http://localhost:8080/api/book"; // Backend URL

// Lấy danh sách sách
export const getAllBooks = async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy danh sách sách:", error);
      return [];
    }
  };

// Thêm sách mới
export const createBook = async (bookData) => {
    try {
      const formData = new FormData();
      for (const key in bookData) {
        formData.append(key, bookData[key]);
      }
      const response = await axios.post(API_URL, formData);
      return response.data;
    } catch (error) {
      console.error("Lỗi thêm sách:", error);
      return null;
    }
  };

// Cập nhật sách
export const updateBook = async (bookId, bookData) => {
    try {
        const formData = new FormData();
        for (const key in bookData) {
            formData.append(key, bookData[key]);
        }
        const response = await axios.put(`${API_URL}/${bookId}`, formData);
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật sách:", error);
        return null;
    }
};

// Xóa sách
export const deleteBook = async (bookId) => {
  try {
    await axios.delete(`${API_URL}/${bookId}`);
    return true;
  } catch (error) {
    console.error("Lỗi xóa sách:", error);
    return false;
  }
};
