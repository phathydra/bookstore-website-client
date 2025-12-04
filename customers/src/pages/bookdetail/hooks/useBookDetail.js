import { useEffect, useState, useCallback } from "react";
import {
  fetchBookDetail,
  fetchRecommendations,
  fetchReviews,
  fetchAnalytics,
  fetchAccount,
  addToCartService,
  fetchSummaryService, // Thêm hàm mới vào đây
} from "../services/bookService";

export const useBookDetail = (id, navigate) => {
  const [book, setBook] = useState(null);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsWithUserData, setReviewsWithUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaseCount, setPurchaseCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const accountId = localStorage.getItem("accountId");

  const openModal = useCallback((content) => {
    setModalContent(content);
    setIsModalOpen(true);
  }, []);
  const closeModal = () => setIsModalOpen(false);

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const fetchUserDataForReviews = async (reviewsData) => {
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
      try {
        const [
          { data: bookData },
          { data: recommendedData },
          { data: reviewsData },
          { data: analyticsData },
        ] = await Promise.all([
          fetchBookDetail(id),
          fetchRecommendations(id, accountId),
          fetchReviews(id),
          fetchAnalytics(id),
        ]);

        setBook(bookData);
        setRecommendedBooks(recommendedData);
        setReviews(reviewsData);
        if (reviewsData?.length) fetchUserDataForReviews(reviewsData);
        setPurchaseCount(analyticsData.purchaseCount || 0);
      } catch (err) {
        setError("Đã có lỗi xảy ra khi tải dữ liệu.");
        openModal("Đã có lỗi xảy ra khi tải dữ liệu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, openModal]);

  const increaseQty = useCallback(() => {
    if (book && quantity < book.bookStockQuantity) setQuantity((q) => q + 1);
  }, [book, quantity]);

  const decreaseQty = useCallback(() => {
    if (quantity > 1) setQuantity((q) => q - 1);
  }, [quantity]);

  const addToCart = async () => {
    if (!book) return;

    const accountId = localStorage.getItem("accountId");
    if (!accountId) {
      alert("Bạn cần đăng nhập để thêm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    if (book.bookStockQuantity <= 0) {
      alert("Sách này đã hết hàng!");
      return;
    }

    try {
      await addToCartService(accountId, book, quantity);
      alert("Sách đã được thêm vào giỏ hàng!");
      navigate("/cart");
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err.response?.data || err.message);
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại!");
    }
  };

  const handlePolicyClick = (policy) => {
    const messages = {
      "Thời gian giao hàng":
        "Thông tin đóng gói, vận chuyển hàng\n\nVới đa phần đơn hàng, bookstore cần vài giờ làm việc để kiểm tra thông tin và đóng gói hàng.",
      "Chính sách đổi trả":
        "Đổi trả miễn phí toàn quốc\n\nSản phẩm có thể được đổi trả miễn phí nếu có lỗi từ nhà sản xuất.",
      "Chính sách khách sỉ":
        "Ưu đãi khi mua số lượng lớn\n\nbookstore cung cấp ưu đãi đặc biệt cho khách hàng mua hàng số lượng lớn.",
    };
    if (messages[policy]) openModal(messages[policy]);
  };

  const handleImageNav = (direction) => {
    if (!book?.bookImages?.length || book.bookImages.length <= 1) return;
    setMainImageIndex((prev) => {
      const len = book.bookImages.length;
      return direction === "next" ? (prev + 1) % len : (prev - 1 + len) % len;
    });
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const calculateRatingPercentage = useCallback(
    (starLevel) => {
      if (!reviews.length) return 0;
      const count = reviews.filter((r) => Math.round(r.rating) === starLevel).length;
      return Math.round((count / reviews.length) * 100);
    },
    [reviews]
  );
  
  // Hàm mới để lấy tóm tắt sách
  const fetchBookSummary = async () => {
    if (!book || !book.bookName || !book.bookAuthor) {
      return "Không đủ thông tin để tạo tóm tắt sách.";
    }
    
    try {
      const summary = await fetchSummaryService(book.bookName, book.bookAuthor);
      return summary;
    } catch (err) {
      console.error("Lỗi khi lấy tóm tắt sách:", err);
      return "Đã xảy ra lỗi khi tạo tóm tắt sách. Vui lòng thử lại sau.";
    }
  };

  return {
    book,
    recommendedBooks,
    reviews,
    reviewsWithUserData,
    loading,
    error,
    quantity,
    purchaseCount,
    isModalOpen,
    modalContent,
    isImageModalOpen,
    selectedImage,
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
    fetchBookSummary, // Thêm hàm này vào return
  };
};