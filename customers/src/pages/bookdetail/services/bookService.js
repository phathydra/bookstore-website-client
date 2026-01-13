import axios from "axios";

const API_URLS = {
  BOOK: "http://localhost:8081/api/book",
  REVIEW: "http://localhost:8081/api/reviews", // Đã trỏ đúng API Review
  ANALYTICS: "http://localhost:8081/api/analytics",
  ACCOUNT: "http://localhost:8080/api/account/fetch",
  CART: "http://localhost:8082/cart/add",
  SUMMARY: "http://localhost:8081/api/summary",
  AI_RECOMMEND: "http://localhost:8086/recommend",
};

export const fetchBookDetail = (id) => axios.get(`${API_URLS.BOOK}/${id}`);

// Logic cũ (Content-based)
export const fetchRecommendations = (id, accountId) =>
  axios.get(
    `${API_URLS.BOOK}/${id}/recommendations?accountId=${accountId}&k=5`
  );

// Logic Collaborative Filtering (Python)
export const fetchCollaborativeRecs = (accountId) => {
  return axios.get(`${API_URLS.AI_RECOMMEND}/${accountId}`, {
    params: { k: 10 },
  });
};

// 🟢 QUAN TRỌNG: Gọi đúng API lấy review theo bookId
export const fetchReviews = (bookId) =>
  axios.get(`${API_URLS.REVIEW}/book/${bookId}`);

export const fetchAnalytics = (id) => axios.get(`${API_URLS.ANALYTICS}/${id}`);

export const fetchAccount = (accountId) =>
  axios.get(`${API_URLS.ACCOUNT}?accountId=${accountId}`);

export const addToCartService = (accountId, book, quantity) =>
  axios.post(API_URLS.CART, {
    accountId,
    cartItems: [
      {
        bookId: book.bookId,
        bookName: book.bookName,
        price: parseFloat(book.bookPrice),
        discountedPrice: book.discountedPrice
          ? parseFloat(book.discountedPrice)
          : null,
        percentage: book.percentage,
        quantity,
        bookImage: book.bookImages?.[0] || book.bookImage,
      },
    ],
  });

export const fetchSummaryService = async (title, author) => {
  try {
    const response = await axios.get(API_URLS.SUMMARY, {
      params: { title, author },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi API tóm tắt:", error);
    return { summary: "Không thể lấy tóm tắt sách." };
  }
};

export const fetchBooksByAuthorService = (authorName, page = 0, size = 5) => {
  const encodedAuthor = encodeURIComponent(authorName);
  return axios.get(`${API_URLS.BOOK}/author/${encodedAuthor}`, {
    params: { page, size },
  });
};

// --- CÁC HÀM TRACKING (ANALYTICS) ---

export const trackAddToCart = (bookId, accountId) => {
  return axios.post(`${API_URLS.ANALYTICS}/${bookId}/add-to-cart`, {
    accountId: accountId,
  });
};

export const trackClickSummary = (bookId, accountId) => {
  return axios.post(`${API_URLS.ANALYTICS}/${bookId}/click-summary`, {
    accountId: accountId,
  });
};

// 🟢 ĐÂY LÀ HÀM BẠN ĐANG BỊ THIẾU
export const trackSearch = (searchTerm, accountId) => {
  return axios.post(`${API_URLS.ANALYTICS}/track/search`, {
    searchTerm: searchTerm,
    accountId: accountId,
  });
};