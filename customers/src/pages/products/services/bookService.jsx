// src/products/services/bookService.js

import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";

export const fetchBooks = async (filterInput, paginationParams) => {
  // Sửa lỗi ở đây
  const response = await axios.post(`${API_BASE_URL}/book/filter`, filterInput, { params: paginationParams });
  return response.data;
};

export const fetchAuthorDetails = async (authorName) => {
  const response = await axios.get(
    `${API_BASE_URL}/author/${encodeURIComponent(authorName)}`
  );
  return response.data;
};