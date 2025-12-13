import axios from "axios";

const API_URLS = {
  BOOK: "http://localhost:8081/api/book",
  REVIEW: "http://localhost:8081/api/reviews",
  ANALYTICS: "http://localhost:8081/api/analytics",
  ACCOUNT: "http://localhost:8080/api/account/fetch",
  CART: "http://localhost:8082/cart/add",
  SUMMARY: "http://localhost:8081/api/summary",
  AI_RECOMMEND: "http://127.0.0.1:8000/api/recommend",
};

export const fetchBookDetail = (id) => axios.get(`${API_URLS.BOOK}/${id}`);

// API 1: "Sản phẩm tương tự" (Content-Based) -> Đã ĐÚNG
export const fetchRecommendations = (id) =>
  axios.get(`${API_URLS.AI_RECOMMEND}/similar-to/${id}`);

// -----------------------------------------------------------------
// ⬇️ THAY ĐỔI: Đổi tên hàm và trỏ đến API "also-bought"
//    API này chỉ cần bookId, không cần accountId
// -----------------------------------------------------------------
export const fetchAlsoBought = (bookId) =>
  axios.get(`${API_URLS.AI_RECOMMEND}/also-bought/${bookId}`);
// -----------------------------------------------------------------

export const fetchReviews = (id) => axios.get(`${API_URLS.REVIEW}/book/${id}`);
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
      params: {
        title: title,
        author: author,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API tóm tắt:", error);
    throw new Error("Không thể lấy tóm tắt sách. Vui lòng thử lại.");
  }
};

export const fetchBooksByAuthorService = (authorName, page = 0, size = 5) => {
  const encodedAuthor = encodeURIComponent(authorName);
  return axios.get(`${API_URLS.BOOK}/author/${encodedAuthor}`, {
    params: {
      page,
      size,
    },
  });
};

export const trackAddToCart = (bookId, accountId) => {
  return axios.post(`${API_URLS.ANALYTICS}/${bookId}/add-to-cart`, {
    accountId: accountId,
  });
};

export const trackSearch = (searchTerm, accountId) => {
  return axios.post(`${API_URLS.ANALYTICS}/track/search`, {
    searchTerm: searchTerm,
    accountId: accountId,
  });
};

export const trackClickSummary = (bookId, accountId) => {
  return axios.post(`${API_URLS.ANALYTICS}/${bookId}/click-summary`, {
    accountId: accountId,
  });
};