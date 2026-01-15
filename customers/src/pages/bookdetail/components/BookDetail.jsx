"use client";

import { useParams, Link, useNavigate } from "react-router-dom";
import { useBookDetail } from "../hooks/useBookDetail";
import { useState, useEffect, useMemo } from "react";
import { useVoucher } from "../../orderdetail/hooks/useVoucher";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaTimes,
  FaInfoCircle,
  FaBook,
  FaGift,
} from "react-icons/fa";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    book,
    recommendedBooks,
    collaborativeBooks,
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
    booksByAuthor,
  } = useBookDetail(id, navigate);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [filterRating, setFilterRating] = useState(0);

  const userId = localStorage.getItem("accountId");

  const displayPrice = useMemo(
    () =>
      book?.discountedPrice && book?.percentage > 0
        ? book.discountedPrice
        : book?.bookPrice,
    [book]
  );

  const totalAmount = useMemo(
    () => (displayPrice || 0) * quantity,
    [displayPrice, quantity]
  );

  const { publicVouchers, isVoucherApplicable } = useVoucher(
    userId,
    totalAmount,
    true
  );

  const handleSummaryClick = async () => {
    setSummaryLoading(true);
    setIsSummaryModalOpen(true);
    const summary = await fetchBookSummary();
    setSummaryContent(summary);
    setSummaryLoading(false);
  };

  const filteredReviews = useMemo(
    () =>
      reviewsWithUserData.filter((review) => {
        if (filterRating === 0) {
          return true;
        }
        return review.rating === filterRating;
      }),
    [reviewsWithUserData, filterRating]
  );

  // Fix an toàn: thêm || 0
  const totalPrice = useMemo(
    () => ((displayPrice || 0) * quantity).toLocaleString(),
    [displayPrice, quantity]
  );

  // Fix an toàn: kiểm tra bookPrice tồn tại
  const originalPrice = useMemo(
    () => (book?.bookPrice ? (book.bookPrice * quantity).toLocaleString() : "0"),
    [book, quantity]
  );

  const bookImages = useMemo(
    () =>
      book
        ? book.bookImages?.length > 0
          ? book.bookImages
          : [book.bookImage]
        : [],
    [book]
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-600 animate-pulse">
          Đang tải...
        </div>
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-500 font-semibold">
        {error}
      </div>
    );
  if (!book)
    return (
      <div className="text-center py-10 text-gray-600">
        Sách không tồn tại.
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen font-sans">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:underline">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:underline">
          Sách
        </Link>
        <span className="mx-2">/</span>
        <span>{book.bookName}</span>
      </div>

      {/* === KHỐI 1: THÔNG TIN SẢN PHẨM CHÍNH (3 CỘT) === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 bg-white !rounded-xl shadow-lg">
        {/* Left Column (Giữ nguyên) */}
        <div className="lg:col-span-1">
          <div className="relative w-full aspect-[3/4] !rounded-lg shadow-md overflow-hidden bg-white">
            <img
              src={bookImages?.[mainImageIndex] || "/placeholder.svg"}
              alt={book.bookName}
              className="w-full h-full object-contain cursor-zoom-in"
              onClick={openImageModal}
            />
            <button
              onClick={handleSummaryClick}
              className="absolute top-4 left-18 flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold !rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
            >
              <FaBook />
              <span>Tóm tắt sách</span>
            </button>
            {bookImages.length > 1 && (
              <>
                <button
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 backdrop-blur-sm !rounded-full p-2 text-gray-800 hover:bg-white transition-colors"
                  onClick={() => handleImageNav("prev")}
                >
                  <FaChevronLeft />
                </button>
                <button
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 backdrop-blur-sm !rounded-full p-2 text-gray-800 hover:bg-white transition-colors"
                  onClick={() => handleImageNav("next")}
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
          <div className="flex overflow-x-auto space-x-2 p-2 mt-4 justify-center w-full">
            {bookImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${book.bookName} - ${index + 1}`}
                className={`w-16 h-20 object-contain !rounded-md cursor-pointer transition-all ${
                  index === mainImageIndex
                    ? "ring-2 ring-blue-600 scale-110 shadow-md"
                    : "opacity-80 hover:opacity-100"
                }`}
                onClick={() => setMainImageIndex(index)}
              />
            ))}
          </div>
          <div className="bg-gray-50 p-6 !rounded-xl shadow-inner mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Chính sách</h3>
            <div className="!space-y-3">
              <button
                onClick={() => handlePolicyClick("Thời gian giao hàng")}
                className="flex items-center text-left space-x-2 text-blue-600 hover:underline"
              >
                <FaInfoCircle size={20} className="flex-shrink-0" />
                <span className="text-sm">
                  Thời gian giao hàng: Giao nhanh và uy tín
                </span>
              </button>
              <button
                onClick={() => handlePolicyClick("Chính sách đổi trả")}
                className="flex items-center text-left space-x-2 text-blue-600 hover:underline"
              >
                <FaInfoCircle size={20} className="flex-shrink-0" />
                <span className="text-sm">
                  Chính sách đổi trả: Đổi trả miễn phí toàn quốc
                </span>
              </button>
              <button
                onClick={() => handlePolicyClick("Chính sách khách sỉ")}
                className="flex items-center text-left space-x-2 text-blue-600 hover:underline"
              >
                <FaInfoCircle size={20} className="flex-shrink-0" />
                <span className="text-sm">
                  Chính sách khách sỉ: Ưu đãi khi mua số lượng lớn
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column (Giữ nguyên) */}
        <div className="lg:col-span-1 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {book.bookName}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">
                ({reviews.length} đánh giá)
              </span>
            </div>
            <span className="w-1 h-1 bg-gray-400 !rounded-full"></span>
            <span className="text-sm text-gray-500">
              Đã bán: {purchaseCount}
            </span>
          </div>
          <div className="bg-gray-50 p-4 !rounded-xl shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg text-gray-700">Giá bán:</span>
              <span className="text-2xl font-bold text-red-600">
                {/* Fix an toàn: thêm ?. */}
                {displayPrice?.toLocaleString()} VNĐ
              </span>
            </div>
            {book.percentage > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-md text-gray-500">Tiết kiệm:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-md text-gray-500 line-through">
                     {/* Fix an toàn: thêm ?. */}
                    {book.bookPrice?.toLocaleString()} VNĐ
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-sm font-semibold !rounded-full">
                    -{book.percentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-4 !rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
              <FaGift className="text-red-500" />
              <span>Khuyến mãi & ưu đãi</span>
            </h3>
            <ul className="space-y-2">
              {publicVouchers.length > 0 ? (
                publicVouchers.map((voucher) => {
                  const isApplicable = isVoucherApplicable(voucher);
                  const discountText =
                    voucher.voucherType === "Percentage Discount"
                      ? `Giảm ${voucher.percentageDiscount}%`
                      : `Giảm ${voucher.valueDiscount?.toLocaleString()} VNĐ`; // Fix an toàn
                  return (
                    <li
                      key={voucher.id}
                      className={`flex flex-col p-2 !rounded-md shadow-sm transition-colors duration-200 ${
                        isApplicable ? "bg-green-50" : "bg-gray-200"
                      }`}
                    >
                      <span className="text-sm font-semibold text-gray-700">
                        {discountText}
                      </span>
                      <p className="text-xs text-gray-500 italic mt-0.5">
                        Đơn tối thiểu {voucher.minOrderValue?.toLocaleString()}{" "}
                        VNĐ
                      </p>
                    </li>
                  );
                })
              ) : (
                <li className="text-sm text-gray-500 italic">
                  Hiện không có voucher nào.
                </li>
              )}
            </ul>
          </div>
          <hr className="my-4 border-t border-gray-200" />
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-700">
              Số lượng:
            </span>
            <div className="flex items-center border border-gray-300 !rounded-full h-10 w-32">
              <button
                onClick={decreaseQty}
                className="w-1/3 text-lg font-bold text-gray-600 hover:text-gray-900 transition"
              >
                -
              </button>
              <span className="w-1/3 text-center text-xl font-semibold text-gray-800">
                {quantity}
              </span>
              <button
                onClick={increaseQty}
                className="w-1/3 text-lg font-bold text-gray-600 hover:text-gray-900 transition"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addToCart}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold !rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
              <FaShoppingCart />
              <span>Thêm vào giỏ hàng</span>
            </button>
          </div>
        </div>

        {/* Right Column (Giữ nguyên) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 p-6 !rounded-xl shadow-inner">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Thông tin chi tiết
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Tác giả:</strong>{" "}
                <Link
                  to={`/products?bookAuthor=${book.bookAuthor}`}
                  className="text-blue-600 hover:underline"
                >
                  {book.bookAuthor}
                </Link>
              </p>
              <p>
                <strong>Nhà xuất bản:</strong>{" "}
                <Link
                  to={`/products?bookPublisher=${book.bookPublisher}`}
                  className="text-blue-600 hover:underline"
                >
                  {book.bookPublisher}
                </Link>
              </p>
              <p>
                <strong>Năm xuất bản:</strong> {book.bookYearOfProduction}
              </p>
              <p>
                <strong>Ngôn ngữ:</strong> {book.bookLanguage}
              </p>
              <p>
                <strong>Thể loại:</strong> {book.bookCategory}
              </p>
              <p>
                <strong>Nhà cung cấp:</strong>{" "}
                <Link
                  to={`/products?bookSupplier=${book.bookSupplier}`}
                  className="text-blue-600 hover:underline"
                >
                  {book.bookSupplier}
                </Link>
              </p>
            </div>
          </div>
          <div className="bg-gray-50 p-6 !rounded-xl shadow-inner">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Sách cùng tác giả
            </h3>
            <div className="space-y-4 max-h-[25rem] overflow-y-auto pr-2">
              {booksByAuthor && booksByAuthor.length > 0 ? (
                booksByAuthor.map((relatedBook) => (
                  <Link
                    key={relatedBook.bookId}
                    to={`/productdetail/${relatedBook.bookId}`}
                    className="group flex items-start space-x-4 p-2 !rounded-lg shadow-sm transition-all duration-300 transform hover:scale-[1.02] hover:bg-gray-50"
                  >
                    <img
                      src={
                        relatedBook.bookImages?.[0] ||
                        relatedBook.bookImage ||
                        "/placeholder.svg"
                      }
                      alt={relatedBook.bookName}
                      className="flex-shrink-0 w-16 h-20 object-contain !rounded-md shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {relatedBook.bookName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {relatedBook.bookAuthor}
                      </p>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        {/* Fix an toàn: thêm || 0 */}
                        {(
                          relatedBook.discountedPrice || relatedBook.bookPrice || 0
                        ).toLocaleString()}{" "}
                        VNĐ
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Không tìm thấy sách khác của tác giả này.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* === KẾT THÚC KHỐI 1 === */}


      {/* ⬇️ SỬA ĐỔI: BẮT ĐẦU KHỐI 2 (LAYOUT 2x2) ⬇️ */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* === CELL 1 (Top-Left): Mô tả sản phẩm === */}
        <div className="bg-white p-6 !rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Mô tả sản phẩm
          </h3>
          <div className="max-h-[30rem] overflow-y-auto pr-2">
            {summaryLoading ? (
              <div className="text-center py-8 text-lg font-medium text-gray-600 animate-pulse">
                Đang tạo tóm tắt...
              </div>
            ) : (
              <p className="text-base text-gray-700 text-justify leading-relaxed whitespace-pre-wrap">
                {summaryContent.summary || book.bookDescription}
              </p>
            )}
          </div>
        </div>

        {/* === CELL 2 (Top-Right): Sản phẩm tương tự === */}
        <div className="bg-white p-6 !rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Sản phẩm tương tự
          </h3>
          <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
            {recommendedBooks.length > 0 ? (
              recommendedBooks.map((recBook) => (
                <Link
                  key={recBook.bookId}
                  to={`/productdetail/${recBook.bookId}`}
                  className="group flex items-start space-x-4 p-2 !rounded-lg shadow-sm transition-all duration-300 transform hover:scale-[1.02] hover:bg-gray-50"
                >
                  <img
                    src={
                      recBook.bookImages?.[0] ||
                      recBook.bookImage ||
                      "/placeholder.svg"
                    }
                    alt={recBook.bookName}
                    className="flex-shrink-0 w-20 h-24 object-contain !rounded-md shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {recBook.bookName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {recBook.bookAuthor}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      {/* Fix an toàn: thêm || 0 */}
                      {(
                        recBook.discountedPrice || recBook.bookPrice || 0
                      ).toLocaleString()}{" "}
                      VNĐ
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                Không tìm thấy sản phẩm tương tự.
              </p>
            )}
          </div>
        </div>

        {/* === CELL 3 (Bottom-Left): Đánh giá sản phẩm === */}
        <div 
          className={`bg-white p-6 !rounded-2xl shadow-lg ${
            collaborativeBooks.length > 0 ? "lg:col-span-1" : "lg:col-span-2"
          }`}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Đánh giá sản phẩm
          </h3>
          <div className="flex items-center space-x-6 mb-4">
            <div className="flex-shrink-0 text-center">
              <div className="text-5xl font-extrabold text-blue-600">
                {averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">trên 5 sao</div>
              <div className="flex mt-1 text-yellow-400 text-lg">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const percentage = calculateRatingPercentage(star);
                return (
                  <div key={star} className="flex items-center">
                    <span className="w-6 text-sm text-gray-600 mr-2">{star}</span>
                    <div className="flex-1 bg-gray-200 h-2 !rounded-full">
                      <div
                        className="bg-yellow-400 h-2 !rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-10 text-right text-xs text-gray-600 ml-2">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <hr className="my-6 border-t border-gray-200" />
          <h4 className="text-lg font-bold text-gray-900 mb-3">
            Bình luận ({filteredReviews.length})
          </h4>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              className={`px-4 py-2 !rounded-full text-sm font-medium transition-colors ${
                filterRating === 0
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setFilterRating(0)}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                className={`px-4 py-2 !rounded-full text-sm font-medium transition-colors ${
                  filterRating === star
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setFilterRating(star)}
              >
                {star} sao
              </button>
            ))}
          </div>
          <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
            {filteredReviews.length === 0 ? (
              <p className="text-center text-gray-500 italic py-8">
                Chưa có đánh giá nào phù hợp.
              </p>
            ) : (
              filteredReviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="bg-gray-50 p-4 !rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-start space-x-3 mb-2">
                    <img
                      src={review.userAvatar || "/placeholder.svg"}
                      alt={review.userName}
                      className="w-10 h-10 !rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {review.userName}
                      </p>
                      <div className="flex flex-col">
                        <div className="flex text-yellow-400 text-sm mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 italic mt-1">
                          {new Date(review.reviewDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed pl-12">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* === CELL 4 (Bottom-Right): Người khác cũng mua === */}
        {collaborativeBooks.length > 0 && (
          <div className="bg-white p-6 !rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Người khác cũng mua
            </h3>
            <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
              {collaborativeBooks.map((recBook) => (
                <Link
                  key={recBook.bookId}
                  to={`/productdetail/${recBook.bookId}`}
                  className="group flex items-start space-x-4 p-2 !rounded-lg shadow-sm transition-all duration-300 transform hover:scale-[1.02] hover:bg-gray-50"
                >
                  <img
                    src={
                      recBook.bookImages?.[0] ||
                      recBook.bookImage ||
                      "/placeholder.svg"
                    }
                    alt={recBook.bookName}
                    className="flex-shrink-0 w-20 h-24 object-contain !rounded-md shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {recBook.bookName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {recBook.bookAuthor}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      {/* Fix an toàn: thêm || 0 */}
                      {(
                        recBook.discountedPrice || recBook.bookPrice || 0
                      ).toLocaleString()}{" "}
                      VNĐ
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* ⬆️ KẾT THÚC SỬA ĐỔI ⬆️ */}


      {/* Modals Section (Giữ nguyên) */}
      {isModalOpen && (
        <Modal onClose={closeModal} title="Thông báo" content={modalContent} />
      )}
      {isImageModalOpen && (
        <ImageModal
          onClose={closeImageModal}
          selectedImage={bookImages?.[mainImageIndex]}
          bookImages={bookImages}
          handleImageNav={handleImageNav}
        />
      )}
      {isSummaryModalOpen && (
        <SummaryModal
          onClose={() => setIsSummaryModalOpen(false)}
          bookName={book.bookName}
          summaryContent={summaryContent}
          summaryLoading={summaryLoading}
        />
      )}
    </div>
  );
};

// ... (Code cho các Modal Components: Modal, ImageModal, SummaryModal)
// Helper Components for Modals
const Modal = ({ onClose, title, content }) => (
  <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
    <div className="bg-white !rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 transition"
        >
          <FaTimes size={20} />
        </button>
      </div>
      <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
        {content}
      </p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-800 !rounded-lg hover:bg-gray-300 transition"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
);

const ImageModal = ({ onClose, selectedImage, bookImages, handleImageNav }) => {
  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-full max-h-[90vh] flex justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={selectedImage}
          alt="Phóng to ảnh sách"
          className="max-w-full max-h-full object-contain !rounded-lg shadow-xl"
        />
        {bookImages.length > 1 && (
          <>
            <button
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/50 backdrop-blur-sm !rounded-full p-3 text-gray-800 hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleImageNav("prev");
              }}
            >
              <FaChevronLeft size={20} />
            </button>
            <button
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/50 backdrop-blur-sm !rounded-full p-3 text-gray-800 hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleImageNav("next");
              }}
            >
              <FaChevronRight size={20} />
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-400 transition"
        >
          <FaTimes size={30} />
        </button>
      </div>
    </div>
  );
};

const SummaryModal = ({
  onClose,
  bookName,
  summaryContent,
  summaryLoading,
}) => (
  <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          Tóm tắt sách: {bookName}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 transition"
        >
          <FaTimes size={20} />
        </button>
      </div>
      <div className="p-6 overflow-y-auto flex-1 text-gray-700 leading-relaxed">
        {summaryLoading ? (
          <div className="text-center py-8 text-lg font-medium text-gray-600 animate-pulse">
            Đang tạo tóm tắt...
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{summaryContent.summary}</p>
        )}
      </div>
      <div className="p-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white font-semibold !rounded-lg hover:bg-blue-700 transition"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
);

export default BookDetail;