import axios from "axios";

const API_URLS = {
  BOOK: "http://localhost:8081/api/book",
  REVIEW: "http://localhost:8081/api/reviews",
  ANALYTICS: "http://localhost:8081/api/analytics",
  ACCOUNT: "http://localhost:8080/api/account/fetch",
  CART: "http://localhost:8082/cart/add",
  SUMMARY: "http://localhost:8081/api/summary" // Thêm API tóm tắt
};

export const fetchBookDetail = (id) => axios.get(`${API_URLS.BOOK}/${id}`);
export const fetchRecommendations = (id, accountId) => axios.get(`${API_URLS.BOOK}/${id}/recommendations?accountId=${accountId}&k=5`);
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

// Hàm mới để gọi API tóm tắt
export const fetchSummaryService = async (title, author) => {
  try {
    const response = await axios.get(API_URLS.SUMMARY, {
      params: {
        title: title,
        author: author,
      },
    });
    return response.data; // Giả sử API trả về chuỗi tóm tắt
  } catch (error) {
    console.error("Lỗi khi gọi API tóm tắt:", error);
    throw new Error("Không thể lấy tóm tắt sách. Vui lòng thử lại.");
  }
};