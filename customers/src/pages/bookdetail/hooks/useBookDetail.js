// Thay thế toàn bộ file hooks/useBookDetail.js

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
  const [recommendedBooks, setRecommendedBooks] = useState([]); // Content-based
  const [collaborativeBooks, setCollaborativeBooks] = useState([]); // Collaborative (AI Python)
  const [booksByAuthor, setBooksByAuthor] = useState([]);
  
  // Dữ liệu đánh giá gốc từ API
  const [reviews, setReviews] = useState([]);
  // Dữ liệu đánh giá đã được ghép thêm tên và avatar user
  const [reviewsWithUserData, setReviewsWithUserData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaseCount, setPurchaseCount] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const accountId = localStorage.getItem("accountId");

  const openModal = useCallback((content) => {
    setModalContent(content);
    setIsModalOpen(true);
  }, []);
  const closeModal = () => setIsModalOpen(false);
  const openImageModal = () => setIsImageModalOpen(true);
  const closeImageModal = () => setIsImageModalOpen(false);

  // 🟢 HÀM MỚI: Xử lý ghép thông tin user vào review
  const processReviewsData = async (rawReviews) => {
    try {
      // 1. Chuẩn hóa dữ liệu review (xử lý _id của Mongo)
      const normalizedReviews = rawReviews.map((r) => ({
        ...r,
        // Nếu _id là object (Mongo $oid) thì lấy $oid, nếu không lấy chính nó
        reviewId: r._id?.$oid || r._id || r.id, 
        // Nếu JSON không có ngày tháng, dùng ngày hiện tại hoặc null
        reviewDate: r.reviewDate || r.createdAt || new Date().toISOString(),
      }));

      setReviews(normalizedReviews);

      // 2. Lấy thông tin user cho từng review dựa trên accountId
      const enrichedReviews = await Promise.all(
        normalizedReviews.map(async (review) => {
          // Mặc định là Khách hàng ẩn danh
          let userInfo = {
            userName: "Khách hàng",
            userAvatar: "https://via.placeholder.com/40",
          };

          if (review.accountId) {
            try {
              const { data: userData } = await fetchAccount(review.accountId);
              userInfo = {
                userName: userData.name || userData.fullName || "Khách hàng",
                userAvatar: userData.avatar || "https://via.placeholder.com/40",
              };
            } catch (err) {
              // Nếu lỗi lấy user (ví dụ user bị xóa), giữ nguyên mặc định
              console.warn(`Không lấy được info cho accountId: ${review.accountId}`);
            }
          }

          return { ...review, ...userInfo };
        })
      );

      // Sắp xếp review mới nhất lên đầu (nếu có ngày)
      enrichedReviews.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
      
      setReviewsWithUserData(enrichedReviews);
    } catch (err) {
      console.error("Lỗi xử lý dữ liệu đánh giá:", err);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy ID sách.");
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
        // Gọi song song các API chính
        const [
          { data: bookData },
          { data: reviewsData }, // 🟢 API Review trả về List<ReviewDTO>
          { data: analyticsData },
        ] = await Promise.all([
          fetchBookDetail(id),
          fetchReviews(id), 
          fetchAnalytics(id),
        ]);

        setBook(bookData);
        setPurchaseCount(analyticsData.purchaseCount || 0);

        // 🟢 Xử lý reviews: Ghép data user
        if (reviewsData && Array.isArray(reviewsData)) {
          await processReviewsData(reviewsData);
        }

        // --- Logic gợi ý sách (Giữ nguyên như cũ) ---
        // 1. Content-based (Java)
        try {
          const { data: aiRecs } = await fetchRecommendations(id, accountId || "guest");
          if (aiRecs?.length > 0) {
            const detailPromises = aiRecs.map(rec => axios.get(`${BACKEND_BOOK_API}/${rec.bookId}`));
            const responses = await Promise.allSettled(detailPromises);
            const validBooks = responses
              .filter(res => res.status === 'fulfilled' && res.value.data)
              .map(res => res.value.data);
            setRecommendedBooks(validBooks);
          }
        } catch (e) { console.error("Lỗi gợi ý content-based", e); }

        // 2. Collaborative Filtering (Python)
        if (accountId) {
          try {
             const { data: collabData } = await fetchCollaborativeRecs(accountId);
             // Python trả về { recommendations: ["id1", "id2"] }
             const recIds = collabData.recommendations || [];
             if (recIds.length > 0) {
               const detailPromises = recIds.map(bookId => axios.get(`${BACKEND_BOOK_API}/${bookId}`));
               const responses = await Promise.allSettled(detailPromises);
               const validBooks = responses
                 .filter(res => res.status === 'fulfilled' && res.value.data)
                 .map(res => res.value.data)
                 .filter(b => b.bookId !== id); // Tránh trùng sách đang xem
               setCollaborativeBooks(validBooks);
             }
          } catch (e) { console.error("Lỗi gợi ý collaborative", e); }
        }

        // 3. Sách cùng tác giả
        if (bookData?.bookAuthor) {
          try {
            const { data: authorData } = await fetchBooksByAuthorService(bookData.bookAuthor);
            if (authorData?.content) {
              setBooksByAuthor(authorData.content.filter(b => b.bookId !== bookData.bookId));
            }
          } catch (e) { console.error("Lỗi sách cùng tác giả", e); }
        }

      } catch (err) {
        console.error(err);
        setError("Đã có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, accountId]); // Re-run khi id sách hoặc user thay đổi

  // Các hàm tiện ích giữ nguyên
  const increaseQty = useCallback(() => {
    if (book && quantity < book.bookStockQuantity) setQuantity((q) => q + 1);
  }, [book, quantity]);

  const decreaseQty = useCallback(() => {
    if (quantity > 1) setQuantity((q) => q - 1);
  }, [quantity]);

  const addToCart = async () => {
    if (!book) return;
    if (!accountId) {
      openModal("Bạn cần đăng nhập để mua hàng!");
      navigate("/login");
      return;
    }
    if (book.bookStockQuantity <= 0) {
      openModal("Sách đã hết hàng!");
      return;
    }
    try {
      await addToCartService(accountId, book, quantity);
      trackAddToCart(book.bookId, accountId).catch(console.warn);
      openModal("Đã thêm vào giỏ hàng!");
      navigate("/cart");
    } catch (err) {
      openModal("Lỗi khi thêm giỏ hàng.");
    }
  };

  const handlePolicyClick = (policy) => {
    const msgs = {
      "Thời gian giao hàng": "Giao hàng nhanh 2-3 ngày.",
      "Chính sách đổi trả": "Đổi trả trong 7 ngày nếu lỗi.",
      "Chính sách khách sỉ": "Liên hệ hotline để nhận chiết khấu.",
    };
    if (msgs[policy]) openModal(msgs[policy]);
  };

  const handleImageNav = (dir) => {
    const imgs = book.bookImages?.length > 0 ? book.bookImages : [book.bookImage];
    if (imgs.length <= 1) return;
    setMainImageIndex((prev) => {
      const len = imgs.length;
      return dir === "next" ? (prev + 1) % len : (prev - 1 + len) % len;
    });
  };

  const averageRating = useMemo(() => 
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  , [reviews]);

  const calculateRatingPercentage = useCallback((star) => {
    if (!reviews.length) return 0;
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return Math.round((count / reviews.length) * 100);
  }, [reviews]);

  const fetchBookSummary = async () => {
    if (book) trackClickSummary(book.bookId, accountId).catch(console.warn);
    return await fetchSummaryService(book?.bookName, book?.bookAuthor);
  };

  return {
    book,
    recommendedBooks,
    collaborativeBooks,
    booksByAuthor,
    reviews,
    reviewsWithUserData, // Dùng cái này để render list comment
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