import { useEffect, useState, useCallback, useMemo } from "react";
import {
  fetchBookDetail,
  fetchRecommendations,
  fetchCollaborativeRecs,
  fetchReviews,
  fetchAnalytics,
  fetchAccount,
  addToCartService,
  fetchSummaryService,
  fetchBooksByAuthorService,
  trackAddToCart,
  trackClickSummary,
} from "../services/bookService";
import axios from "axios";
const BACKEND_BOOK_API = "http://localhost:8081/api/book";

export const useBookDetail = (id, navigate) => {
  const [book, setBook] = useState(null);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [collaborativeBooks, setCollaborativeBooks] = useState([]);
  const [booksByAuthor, setBooksByAuthor] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsWithUserData, setReviewsWithUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaseCount, setPurchaseCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // ✅ Biến accountId này đã được lấy ở đây rồi
  const accountId = localStorage.getItem("accountId");

  const openModal = useCallback((content) => {
    setModalContent(content);
    setIsModalOpen(true);
  }, []);
  const closeModal = () => setIsModalOpen(false);

  const openImageModal = () => {
    setIsImageModalOpen(true);
  };
  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const fetchUserDataForReviews = async (reviewsData) => {
    // ... (giữ nguyên code cũ) ...
    try {
      const data = await Promise.all(
        reviewsData.map(async (review) => {
          if (review.accountId) {
            try {
              const { data: userData } = await fetchAccount(review.accountId);
              return {
                ...review,
                userName: userData.name || review.reviewerName || "Khách hàng",
                userAvatar: userData.avatar || "https://via.placeholder.com/40",
              };
            } catch {
              return {
                ...review,
                userName: review.reviewerName || "Khách hàng",
                userAvatar: "https://via.placeholder.com/40",
              };
            }
          }
          return {
            ...review,
            userName: review.reviewerName || "Khách hàng",
            userAvatar: "https://via.placeholder.com/40",
          };
        })
      );
      setReviewsWithUserData(data);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin người dùng cho đánh giá:", err);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Không có ID sách.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setBooksByAuthor([]);
      setRecommendedBooks([]);
      setCollaborativeBooks([]);
      setMainImageIndex(0);
      setQuantity(1);

      try {
        const [
          { data: bookData },
          { data: reviewsData },
          { data: analyticsData },
        ] = await Promise.all([
          fetchBookDetail(id),
          // ✅ Ở đây dùng accountId lấy từ dòng 35, không bị lỗi nữa
          fetchRecommendations(id, accountId), 
          fetchReviews(id),
          fetchAnalytics(id),
        ]);

        setBook(bookData);
        setReviews(reviewsData);
        if (reviewsData?.length) fetchUserDataForReviews(reviewsData);
        setPurchaseCount(analyticsData.purchaseCount || 0);

        // LOGIC 1: "Sản phẩm tương tự" (Content-Based)
        try {
          const { data: aiRecs } = await fetchRecommendations(id);
          
          if (aiRecs && aiRecs.length > 0) {
            const bookDetailPromises = aiRecs.map(rec => 
              axios.get(`${BACKEND_BOOK_API}/${rec.bookId}`)
            );
            const bookDetailResponses = await Promise.allSettled(bookDetailPromises);
            const fullBookObjects = bookDetailResponses
              .filter(res => res.status === 'fulfilled' && res.value.data)
              .map(res => res.value.data);
            setRecommendedBooks(fullBookObjects);
          }
        } catch (recErr) {
          console.error("Lỗi khi lấy gợi ý AI (similar-to):", recErr);
          setRecommendedBooks([]);
        }

        // ⬇️ LOGIC MỚI: "NGƯỜI KHÁC CŨNG MUA" (Collaborative) ⬇️
        
        // ❌ XÓA DÒNG NÀY ĐI (đây là nguyên nhân gây lỗi)
        // const accountId = localStorage.getItem("accountId"); 

        // ✅ Code ở dưới sẽ tự động dùng biến accountId ở dòng 35
        if (accountId) { 
            try {
                const { data: aiCollabRecs } = await fetchCollaborativeRecs(accountId);
                
                if (aiCollabRecs && aiCollabRecs.length > 0) {
                    const bookDetailPromises = aiCollabRecs.map(rec => 
                        axios.get(`${BACKEND_BOOK_API}/${rec.bookId}`)
                    );
                    
                    const bookDetailResponses = await Promise.allSettled(bookDetailPromises);
                    
                    const fullBookObjects = bookDetailResponses
                        .filter(res => res.status === 'fulfilled' && res.value.data)
                        .map(res => res.value.data)
                        .filter(book => book.bookId !== id); 
                        
                    setCollaborativeBooks(fullBookObjects);
                }
            } catch (collabErr) {
                console.error("Lỗi khi lấy gợi ý AI (for-user):", collabErr);
                setCollaborativeBooks([]);
            }
        }
        // ⬆️ KẾT THÚC LOGIC MỚI ⬆️

        // ... (Phần còn lại giữ nguyên) ...
        if (bookData && bookData.bookAuthor) {
          try {
            const { data: authorBooksPage } = await fetchBooksByAuthorService(
              bookData.bookAuthor, 0, 5 
            );
            if (authorBooksPage && authorBooksPage.content) {
              setBooksByAuthor(
                authorBooksPage.content.filter(b => b.bookId !== bookData.bookId)
              );
            }
          } catch (authorErr) {
            console.error("Lỗi khi lấy sách cùng tác giả:", authorErr);
            setBooksByAuthor([]);
          }
        }
        
      } catch (err) {
        setError("Đã có lỗi xảy ra khi tải dữ liệu.");
        openModal("Đã có lỗi xảy ra khi tải dữ liệu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, openModal, accountId]); // Thêm accountId vào dependency array cho chuẩn

  // ... (Các hàm increaseQty, decreaseQty, addToCart... giữ nguyên) ...
  // Lưu ý: Trong hàm addToCart cũng có khai báo lại accountId, 
  // nhưng ở đó nó nằm trong hàm riêng biệt nên không sao.
  // Tuy nhiên tốt nhất là xóa luôn dòng `const accountId...` trong addToCart 
  // và dùng biến chung ở trên cùng.

  const increaseQty = useCallback(() => {
    if (book && quantity < book.bookStockQuantity) setQuantity((q) => q + 1);
  }, [book, quantity]);

  const decreaseQty = useCallback(() => {
    if (quantity > 1) setQuantity((q) => q - 1);
  }, [quantity]);

  const addToCart = async () => {
    if (!book) return;
    // const accountId = localStorage.getItem("accountId"); // Có thể xóa dòng này luôn cũng được
    if (!accountId) {
      openModal("Bạn cần đăng nhập để thêm vào giỏ hàng!");
      navigate("/login");
      return;
    }
    // ... code còn lại ...
    if (book.bookStockQuantity <= 0) {
      openModal("Sách này đã hết hàng!");
      return;
    }
    try {
      await addToCartService(accountId, book, quantity);
      trackAddToCart(book.bookId, accountId).catch(analyticsError => {
        console.warn("Lỗi khi tracking analytics (add-to-cart):", analyticsError);
      });
      openModal("Sách đã được thêm vào giỏ hàng!");
      navigate("/cart");
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err.response?.data || err.message);
      openModal("Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại!");
    }
  };

  const handlePolicyClick = (policy) => {
    const messages = {
      "Thời gian giao hàng": "Thông tin đóng gói, vận chuyển hàng...",
      "Chính sách đổi trả": "Đổi trả miễn phí toàn quốc...",
      "Chính sách khách sỉ": "Ưu đãi khi mua số lượng lớn...",
    };
    if (messages[policy]) openModal(messages[policy]);
  };

  const handleImageNav = (direction) => {
    const bookImages = book.bookImages?.length > 0 ? book.bookImages : [book.bookImage];
    if (bookImages.length <= 1) return;
    setMainImageIndex((prev) => {
      const len = bookImages.length;
      return direction === "next" ? (prev + 1) % len : (prev - 1 + len) % len;
    });
  };

  const averageRating = useMemo(() => (
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0
  ), [reviews]);

  const calculateRatingPercentage = useCallback(
    (starLevel) => {
      if (!reviews.length) return 0;
      const count = reviews.filter((r) => Math.round(r.rating) === starLevel).length;
      return Math.round((count / reviews.length) * 100);
    },
    [reviews]
  );
  
  const fetchBookSummary = async () => {
    if (book) {
      // trackClickSummary dùng accountId global OK
      trackClickSummary(book.bookId, accountId).catch(err => {
        console.warn("Lỗi khi tracking summary click:", err);
      });
    }
    if (!book || !book.bookName || !book.bookAuthor) {
      return { summary: "Không đủ thông tin để tạo tóm tắt sách." };
    }
    try {
      const summary = await fetchSummaryService(book.bookName, book.bookAuthor);
      return summary;
    } catch (err) {
      console.error("Lỗi khi lấy tóm tắt sách:", err);
       return { summary: "Đã xảy ra lỗi khi tạo tóm tắt sách. Vui lòng thử lại sau." };
    }
  };

  return {
    book,
    recommendedBooks,
    collaborativeBooks,
    booksByAuthor,
    reviews,
    reviewsWithUserData,
    loading,
    error,
    quantity,
    purchaseCount,
    isModalOpen,
    modalContent,
    isImageModalOpen,
    mainImageIndex,
    openModal,
    closeModal,
    openImageModal,
    closeImageModal,
    increaseQty,
    decreaseQty,
    addToCart,
    handlePolicyClick,
    handleImageNav,
    setMainImageIndex,
    averageRating,
    calculateRatingPercentage,
    fetchBookSummary,
  };
};