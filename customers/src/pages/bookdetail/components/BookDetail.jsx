"use client";

import { useParams, Link, useNavigate } from "react-router-dom";
import { useBookDetail } from "../hooks/useBookDetail";
import { useState } from "react";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
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
    fetchBookSummary,
  } = useBookDetail(id, navigate);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleSummaryClick = async () => {
    setSummaryLoading(true);
    setIsSummaryModalOpen(true);
    const summary = await fetchBookSummary();
    setSummaryContent(summary);
    setSummaryLoading(false);
  };

  if (loading) return <div className="text-center py-10 text-lg">Đang tải...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!book)
    return <div className="text-center py-10 text-gray-600">Sách không tồn tại.</div>;

  const bookImages = book.bookImages && book.bookImages.length > 0 ? book.bookImages : [book.bookImage];
  const displayPrice = book.discountedPrice && book.percentage > 0 ? book.discountedPrice : book.bookPrice;
  const totalPrice = (displayPrice * quantity).toLocaleString();
  const originalPrice = (book.bookPrice * quantity).toLocaleString();

  return (
    <div className="container mx-auto !px-4 !py-6">
      <div className="flex flex-col md:flex-row bg-white shadow-lg !rounded-lg overflow-hidden border p-5">
        <div className="md:w-1/3 flex flex-col items-center">
          {/* PHẦN ẢNH SÁCH */}
          <div className="relative w-72 h-96 !rounded-lg shadow-md overflow-hidden bg-gray-100">
            <img
              src={bookImages?.[mainImageIndex] || "/placeholder.svg"}
              alt={book.bookName}
              className="w-full h-full object-contain cursor-zoom-in"
              onClick={() => openImageModal(bookImages?.[mainImageIndex])}
            />
            {bookImages.length > 1 && (
              <>
                <button
                  className="absolute top-1/2 left-0 -translate-y-1/2 bg-gray-200 !rounded-full p-2 hover:bg-gray-300"
                  onClick={() => handleImageNav("prev")}
                >
                  &#60;
                </button>
                <button
                  className="absolute top-1/2 right-0 -translate-y-1/2 bg-gray-200 !rounded-full p-2 hover:bg-gray-300"
                  onClick={() => handleImageNav("next")}
                >
                  &#62;
                </button>
              </>
            )}
          </div>
          {bookImages.length > 1 && (
            <div className="flex space-x-2 mt-2 overflow-x-auto">
              {bookImages.map((img, index) => (
                <div
                  key={index}
                  className={`w-16 h-20 rounded cursor-pointer border-2 ${
                    index === mainImageIndex ? "border-blue-500" : "border-gray-300"
                  } overflow-hidden`}
                  onClick={() => setMainImageIndex(index)}
                >
                  <img
                    src={img}
                    alt={`${book.bookName} - ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}

          {/* NÚT THÊM VÀO GIỎ HÀNG VÀ SỐ LƯỢNG */}
          <div className="flex items-center !space-x-2 mt-4">
            <div className="flex items-center bg-white border-2 !border-gray-500 rounded-xl px-3 py-2 text-lg font-semibold w-[140px] h-14 justify-between">
              <button onClick={decreaseQty} className="px-2 py-1 text-black">
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button onClick={increaseQty} className="px-2 py-1 text-black">
                +
              </button>
            </div>
            <button
              className="px-6 py-3 bg-green-700 text-white text-lg !font-semibold !rounded-xl hover:scale-105 hover:bg-green-800 transition shadow-md hover:shadow-lg"
              onClick={addToCart}
            >
              Thêm vào
            </button>
          </div>

          {/* CHÍNH SÁCH MUA HÀNG & ĐÁNH GIÁ */}
          <div className="!mt-4 !p-4 bg-gray-100 !rounded-lg text-gray-700 text-sm w-full">
            <h3 className="font-semibold text-base mb-2">Chính sách mua hàng</h3>
            <div className="space-y-2">
              <button onClick={() => handlePolicyClick("Thời gian giao hàng")} className="text-blue-600 !text-start block">
                Thời gian giao hàng: Giao nhanh và uy tín
              </button>
              <button onClick={() => handlePolicyClick("Chính sách đổi trả")} className="text-blue-600 !text-start block">
                Chính sách đổi trả: Đổi trả miễn phí toàn quốc
              </button>
              <button onClick={() => handlePolicyClick("Chính sách khách sỉ")} className="text-blue-600 !text-start block">
                Chính sách khách sỉ: Ưu đãi khi mua số lượng lớn
              </button>
            </div>

            <div className="mt-6">
              <h4 className="text-base font-semibold text-gray-800 mb-2">Đánh giá sản phẩm</h4>
              <div className="flex items-start">
                <div className="mr-4">
                  <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="text-sm">/5</div>
                  <div className="flex mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">
                        {star <= Math.round(averageRating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">({reviews.length} đánh giá)</div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const percentage = calculateRatingPercentage(star);
                    return (
                      <div key={star} className="flex items-center mb-1">
                        <div className="w-16 text-sm">{star} sao</div>
                        <div className="flex-1 mx-2 bg-gray-200 h-2 rounded-full">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-right text-xs">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                {reviewsWithUserData.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {reviewsWithUserData.map((review) => (
                      <div key={review.reviewId} className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-2">
                          <img
                            src={review.userAvatar || "/placeholder.svg"}
                            alt={review.userName}
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-blue-800">{review.userName}</p>
                            <div className="flex text-yellow-400 text-xs">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 ml-10">{review.comment}</p>
                        {review.reviewDate && (
                          <p className="text-xs text-gray-500 mt-1 italic ml-10">
                            {new Date(review.reviewDate).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN THÔNG TIN SÁCH */}
        <div className="hidden md:block border-l-2 border-gray-300 mx-4"></div>
        <div className="md:w-2/3 p-5">
          <div className="flex items-center mb-2">
            <h2 className="!text-2xl font-bold text-gray-800 mr-4">{book.bookName}</h2>
            <button
              onClick={handleSummaryClick}
              className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition shadow-md"
            >
              Tóm tắt
            </button>
          </div>
          {book.percentage > 0 ? (
            <div>
              <div className="text-2xl font-bold text-red-600">{totalPrice} VNĐ</div>
              <div className="text-lg text-gray-500 line-through">
                {originalPrice} VNĐ
              </div>
              <div className="text-lg font-semibold text-green-600">-{book.percentage}%</div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-800">{totalPrice} VNĐ</div>
          )}
          <p className="!text-lg my-2">
            <span className="px-3 py-1 bg-blue-400 text-white rounded-lg font-semibold">
              {`${book.bookStockQuantity} sản phẩm còn`}
            </span>
          </p>
          <p className="text-sm text-gray-600 italic">Đã bán: {purchaseCount} quyển</p>
          <hr className="my-4 border-gray-300" />
          <div>
            <p className="text-lg font-semibold">THÔNG TIN CHI TIẾT</p>
            <p>
              <strong>Tác giả:</strong>{" "}
              <Link to={`/products?bookAuthor=${book.bookAuthor}`} className="text-blue-600 underline">
                {book.bookAuthor}
              </Link>
            </p>
            <p>
              <strong>Nhà xuất bản:</strong>{" "}
              <Link to={`/products?bookPublisher=${book.bookPublisher}`} className="text-blue-600 underline">
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
              <Link to={`/products?bookSupplier=${book.bookSupplier}`} className="text-blue-600 underline">
                {book.bookSupplier}
              </Link>
            </p>
          </div>
          <hr className="my-4 border-gray-300" />
          <div>
            <h3 className="text-xl font-semibold border-b pb-2">MÔ TẢ SÁCH</h3>
            <p className="text-base text-gray-600 mt-4 text-justify">{book.bookDescription}</p>
          </div>
        </div>
      </div>

      {/* SÁCH ĐỀ XUẤT */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold border-b pb-2">GIỚI THIỆU CHO BẠN</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 !gap-2 !mt-2">
          {recommendedBooks.map((recBook) => (
            <Link
              key={recBook.bookId}
              to={`/productdetail/${recBook.bookId}`}
              className="block bg-white shadow-md rounded-md overflow-hidden border !no-underline transition-transform transform hover:scale-105"
            >
              <div className="w-full aspect-[3/4] overflow-hidden">
                <img
                  src={recBook.bookImages?.[0] || recBook.bookImage || "/placeholder.svg"}
                  alt={recBook.bookName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <p className="text-center text-sm font-semibold text-gray-700 truncate">{recBook.bookName}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* MODAL THÔNG BÁO CHÍNH SÁCH */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white !rounded-md shadow-lg w-96 max-w-lg">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">Thông báo</h2>
              <p className="text-gray-700 !text-justify !leading-relaxed">{modalContent}</p>
              <div className="!mt-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PHÓNG TO ẢNH */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeImageModal();
            }
          }}
        >
          <div className="relative w-3/4 h-3/4 bg-[rgba(255,255,255,0.3)] !rounded-lg flex justify-center items-center p-4">
            <img
              src={selectedImage}
              alt="Phóng to ảnh sách"
              className="max-w-full max-h-full object-contain !rounded-lg"
            />
            {bookImages.length > 1 && (
              <>
                <button
                  className="absolute top-1/2 left-4 -translate-y-1/2 bg-gray-200 !rounded-full p-2 hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageNav("prev");
                  }}
                >
                  &#60;
                </button>
                <button
                  className="absolute top-1/2 right-4 -translate-y-1/2 bg-gray-200 !rounded-full p-2 hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageNav("next");
                  }}
                >
                  &#62;
                </button>
              </>
            )}
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-rose-700 text-3xl font-bold p-2 bg-white !rounded-full hover:text-gray-700"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      
      {/* MODAL TÓM TẮT SÁCH */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white !rounded-md !shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Tóm tắt sách: {book.bookName}</h2>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold !rounded-lg "
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-gray-700">
              {summaryLoading ? (
                <div className="text-center text-lg">Đang tạo tóm tắt...</div>
              ) : (
                <p className="whitespace-pre-wrap">{summaryContent.summary}</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;