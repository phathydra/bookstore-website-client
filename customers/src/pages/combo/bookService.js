import axios from 'axios';

// Cấu hình base URL cho BOOK-SERVICE (Cổng 8081)
const bookApi = axios.create({
  baseURL: 'http://localhost:8081', 
});

/**
 * THÊM MỚI: Lấy chi tiết nhiều sách bằng mảng ID
 */
export const getBookDetailsByIds = (bookIds) => {
  // POST /api/public/books/by-ids
  return bookApi.post('/api/book/by-ids', bookIds); // Gửi mảng ID trong body
};