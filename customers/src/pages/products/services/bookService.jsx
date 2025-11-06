// src/products/services/bookService.js

import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";
const ANALYTICS_API_URL = `${API_BASE_URL}/analytics`;

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

export const trackFilter = (filterObject, accountId) => {
  // Biến đổi object filter thành một chuỗi JSON
  const filterData = JSON.stringify(filterObject);
  
  // Gửi POST đến endpoint mới
  return axios.post(`${ANALYTICS_API_URL}/track/filter`, {
    accountId: accountId,
    filterData: filterData, // <-- Gửi chuỗi JSON
  });
};