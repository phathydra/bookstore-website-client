"use client"

import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"

const BookDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewsWithUserData, setReviewsWithUserData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState("")

  useEffect(() => {
    if (!id) {
      setError("Không có ID sách.")
      setLoading(false)
      return
    }

    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/book/${id}`)
        setBook(response.data)
      } catch (err) {
        setError("Không thể tải dữ liệu sách.")
        openModal("Không thể tải dữ liệu sách.")
      } finally {
        setLoading(false)
      }
    }

    const fetchRecommendedBooks = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/book/${id}/recommendations`)
        setRecommendedBooks(response.data)
      } catch (err) {
        console.error("Lỗi tải sách đề xuất:", err)
      }
    }

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/reviews/book/${id}`)
        setReviews(response.data)

        // Sau khi lấy reviews, lấy thông tin người dùng cho mỗi đánh giá
        if (response.data && response.data.length > 0) {
          fetchUserDataForReviews(response.data)
        }
      } catch (err) {
        console.error("Lỗi tải đánh giá:", err)
      }
    }

    fetchBook()
    fetchRecommendedBooks()
    fetchReviews()
  }, [id])

  // Hàm lấy thông tin người dùng cho mỗi đánh giá
  const fetchUserDataForReviews = async (reviewsData) => {
    try {
      const reviewsWithData = await Promise.all(
        reviewsData.map(async (review) => {
          if (review.accountId) {
            try {
              const response = await fetch(`http://localhost:8080/api/account/fetch?accountId=${review.accountId}`)
              const userData = await response.json()
              return {
                ...review,
                userName: userData.name || review.reviewerName || "Khách hàng",
                userAvatar: userData.avatar || "https://via.placeholder.com/40",
              }
            } catch (error) {
              console.error(`Lỗi khi lấy thông tin người dùng cho đánh giá ID ${review.id}:`, error)
              return {
                ...review,
                userName: review.reviewerName || "Khách hàng",
                userAvatar: "https://via.placeholder.com/40",
              }
            }
          } else {
            return {
              ...review,
              userName: review.reviewerName || "Khách hàng",
              userAvatar: "https://via.placeholder.com/40",
            }
          }
        }),
      )
      setReviewsWithUserData(reviewsWithData)
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng cho đánh giá:", error)
    }
  }

  const handleIncrease = () => {
    if (book && quantity < book.bookStockQuantity) {
      setQuantity((prev) => prev + 1)
    }
  }

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1)
  }

  const addToCart = async () => {
    if (!book) return

    const accountId = localStorage.getItem("accountId")
    if (!accountId) {
      alert("Bạn cần đăng nhập để thêm vào giỏ hàng!")
      navigate("/login")
      return
    }

    if (book.bookStockQuantity <= 0) {
      alert("Sách này đã hết hàng!")
      return
    }

    try {
      const response = await axios.post("http://localhost:8082/cart/add", {
        accountId: accountId,
        cartItems: [
          {
            bookId: book.bookId,
            bookName: book.bookName,
            price: Number.parseFloat(book.bookPrice),
            discountedPrice: book.discountedPrice ? Number.parseFloat(book.discountedPrice) : null,
            percentage: book.percentage,
            quantity: quantity,
            bookImage: book.bookImage,
          },
        ],
      })

      if (response.status === 200) {
        alert("Sách đã được thêm vào giỏ hàng!")
        navigate("/cart")
      } else {
        alert("Thêm vào giỏ hàng thất bại! Hãy thử lại.")
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error.response?.data || error.message)
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại!")
    }
  }

  const openModal = (content) => {
    setModalContent(content)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handlePolicyClick = (policy) => {
    switch (policy) {
      case "Thời gian giao hàng":
        openModal(
          "Thông tin đóng gói, vận chuyển hàng\n\nVới đa phần đơn hàng, Fahasa.com cần vài giờ làm việc để kiểm tra thông tin và đóng gói hàng.",
        )
        break
      case "Chính sách đổi trả":
        openModal("Đổi trả miễn phí toàn quốc\n\nSản phẩm có thể được đổi trả miễn phí nếu có lỗi từ nhà sản xuất.")
        break
      case "Chính sách khách sỉ":
        openModal(
          "Ưu đãi khi mua số lượng lớn\n\nFahasa.com cung cấp ưu đãi đặc biệt cho khách hàng mua hàng số lượng lớn.",
        )
        break
      default:
        break
    }
  }

  const calculateTotalPrice = () => {
    if (book.discountedPrice && book.percentage > 0) {
      return book.discountedPrice * quantity
    } else {
      return book.bookPrice * quantity
    }
  }

  // Tính trung bình đánh giá
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    return totalRating / reviews.length
  }

  // Tính phần trăm cho mỗi mức sao
  const calculateRatingPercentage = (starLevel) => {
    if (reviews.length === 0) return 0
    const count = reviews.filter((review) => Math.round(review.rating) === starLevel).length
    return Math.round((count / reviews.length) * 100)
  }

  const averageRating = calculateAverageRating()

  if (loading) return <div className="text-center py-10 text-lg">Đang tải...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>
  if (!book) return <div className="text-center py-10 text-gray-600">Sách không tồn tại.</div>

  return (
    <div className="container mx-auto !px-4 !py-6">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden border p-5">
        <div className="md:w-1/3 flex flex-col items-center">
          <img
            src={book.bookImage || "/placeholder.svg"}
            alt={book.bookName}
            className="w-72 h-auto rounded-lg shadow-md"
          />
          <div className="flex items-center !space-x-2 mt-4">
            <div className="flex items-center bg-white border-2 !border-gray-500 rounded-xl px-3 py-2 text-lg font-semibold w-[140px] h-14 justify-between">
              <button onClick={handleDecrease} className="px-2 py-1 text-black">
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button onClick={handleIncrease} className="px-2 py-1 text-black">
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
          <div className="!mt-4 !p-4 bg-gray-100 !rounded-lg text-gray-700 text-sm w-full">
            <h3 className="font-semibold text-base mb-2">Chính sách mua hàng</h3>
            <div className="space-y-2">
              <button
                onClick={() => handlePolicyClick("Thời gian giao hàng")}
                className="text-blue-600 !text-start block"
              >
                Thời gian giao hàng: Giao nhanh và uy tín
              </button>
              <button
                onClick={() => handlePolicyClick("Chính sách đổi trả")}
                className="text-blue-600 !text-start block"
              >
                Chính sách đổi trả: Đổi trả miễn phí toàn quốc
              </button>
              <button
                onClick={() => handlePolicyClick("Chính sách khách sỉ")}
                className="text-blue-600 !text-start block"
              >
                Chính sách khách sỉ: Ưu đãi khi mua số lượng lớn
              </button>
            </div>

            {/* PHẦN ĐÁNH GIÁ */}
            <div className="mt-6">
              <h4 className="text-base font-semibold text-gray-800 mb-2">Đánh giá sản phẩm</h4>
              <div className="flex items-start">
                <div className="mr-4">
                  <div className="text-4xl font-bold">{reviews.length > 0 ? averageRating.toFixed(1) : 0}</div>
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
                    const percentage = calculateRatingPercentage(star)
                    return (
                      <div key={star} className="flex items-center mb-1">
                        <div className="w-16 text-sm">{star} sao</div>
                        <div className="flex-1 mx-2 bg-gray-200 h-2 rounded-full">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="w-8 text-right text-xs">{percentage}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Hiển thị bình luận với avatar và tên người dùng */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                {reviewsWithUserData.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {reviewsWithUserData.map((review, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-gray-200 shadow-sm">
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

        <div className="hidden md:block border-l-2 border-gray-300 mx-4"></div>

        <div className="md:w-2/3 p-5">
          <h2 className="!text-2xl font-bold text-gray-800 mb-2">{book.bookName}</h2>
          {book.percentage > 0 ? (
            <div>
              <div className="text-2xl font-bold text-red-600">{calculateTotalPrice().toLocaleString()} VNĐ</div>
              <div className="text-lg text-gray-500 line-through">
                {(book.bookPrice * quantity).toLocaleString()} VNĐ
              </div>
              <div className="text-lg font-semibold text-green-600">-{book.percentage}%</div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-800">{calculateTotalPrice().toLocaleString()} VNĐ</div>
          )}

          <p className="!text-lg my-2">
            <span className="px-3 py-1 bg-blue-400 text-white rounded-lg font-semibold">
              {`${book.bookStockQuantity} sản phẩm còn`}
            </span>
          </p>

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

      {/* Sách đề xuất */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold border-b pb-2">GIỚI THIỆU CHO BẠN</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {recommendedBooks.map((recBook) => (
            <Link
              key={recBook.bookId}
              to={`/productdetail/${recBook.bookId}`}
              className="block bg-white shadow-lg rounded-lg overflow-hidden p-4 border"
            >
              <img
                src={recBook.bookImage || "/placeholder.svg"}
                alt={recBook.bookName}
                className="w-full h-52 object-cover rounded-lg"
              />
              <p className="mt-2 text-center text-base font-semibold text-gray-700">{recBook.bookName}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BookDetail

