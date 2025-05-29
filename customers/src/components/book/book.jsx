import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Book = ({ book }) => {
    const navigate = useNavigate();
    const [viewCount, setViewCount] = useState(0);
    const [purchaseCount, setPurchaseCount] = useState(0);
    const [rating, setRating] = useState(0); // ⭐ Thêm rating

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!book || !book.bookId) return;

            // Fetch analytics data (viewCount)
            try {
                const analyticsRes = await axios.get(`http://localhost:8081/api/analytics/${book.bookId}`);
                setViewCount(analyticsRes.data.viewCount || 0);
            } catch (error) {
                console.error("Lỗi lấy analytics:", error);
                setViewCount(0);
            }

            // Fetch top-selling data (purchaseCount)
            try {
                const topSellingRes = await axios.get("http://localhost:8082/api/orders/top-selling");
                const topSellingBooks = topSellingRes.data;
                const foundBook = topSellingBooks.find(item => item.bookId === book.bookId);
                // --- CHỈNH SỬA TẠI ĐÂY ---
                // Thay đổi từ 'totalSoldQuantity' thành 'totalSold'
                setPurchaseCount(foundBook ? foundBook.totalSold : 0); 
                // --- KẾT THÚC CHỈNH SỬA ---
            } catch (error) {
                console.error("Lỗi lấy dữ liệu sách bán chạy:", error);
                setPurchaseCount(0); // Set to 0 if there's an error or no data
            }

            // Fetch review data (rating)
            try {
                const reviewRes = await axios.get(`http://localhost:8081/api/reviews/book/${book.bookId}`);
                const reviews = reviewRes.data;
                if (Array.isArray(reviews) && reviews.length > 0) {
                    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
                    const avg = total / reviews.length;
                    setRating(avg);
                } else {
                    setRating(0);
                }
            } catch (error) {
                console.error("Lỗi lấy đánh giá:", error);
                setRating(0);
            }
        };

        fetchBookDetails();
    }, [book.bookId]);

    const handleSelect = async () => {
        if (!book || !book.bookId) {
            console.error("Lỗi: ID sách không hợp lệ", book);
            return;
        }

        try {
            await axios.post(`http://localhost:8081/api/analytics/${book.bookId}/view`);
            setViewCount(prev => prev + 1);
        } catch (error) {
            console.error("Không thể gửi lượt xem:", error);
        }

        navigate(`/productdetail/${book.bookId}`);
    };

    // ⭐ Hiển thị biểu tượng sao
    const renderStars = () => {
        const rounded = Math.round(rating);
        return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
    };

    return (
        <div
            className="relative flex flex-col items-start m-2 p-3 h-80 w-56 rounded-md bg-white text-gray-800 transition-transform duration-200 transform hover:translate-y-1 hover:shadow-lg cursor-pointer"
            onClick={handleSelect}
        >
            {/* Lượt xem */}
            <div className="absolute top-2 right-2 text-sm text-gray-600 z-10">
                👁 {viewCount}
            </div>

            {/* Nhãn dán "Cháy hàng" */}
            {book.bookStockQuantity === 0 && (
                <div className="absolute top-9 right-9 transform rotate-[-20deg] bg-red-600 text-white text-sm font-bold px-4 py-1 rounded-sm shadow-md">
                    🔥 Cháy hàng
                </div>
            )}

            {/* Hình ảnh sách */}
            <div className="w-full h-48 overflow-hidden mb-3">
                <img
                    className="w-full h-full object-cover"
                    src={book.bookImage}
                    alt={book.bookName}
                />
            </div>

            {/* Tên sách */}
            <div className="flex flex-col items-start flex-grow w-full text-left">
                <div className="text-lg text-gray-800 max-h-12 overflow-hidden overflow-ellipsis line-clamp-2">
                    {book.bookName}
                </div>
            </div>

            {/* Giá và lượt bán */}
            <div className="flex flex-col items-start w-full pt-2 space-y-1">
                {book.percentage > 0 ? (
                    <>
                        <div className="text-lg font-semibold text-red-600">
                            {book.discountedPrice.toLocaleString()} VND
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <div className="line-through">
                                {book.bookPrice.toLocaleString()} VND
                            </div>
                            <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold !ml-2">
                                -{book.percentage}%
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-lg font-semibold text-gray-800">
                        {book.bookPrice.toLocaleString()} VND
                    </div>
                )}

                <div className="text-sm font-light text-gray-500 flex items-center justify-between w-full">
                    <span>Đã bán: {purchaseCount} quyển</span>
                    <span className="text-yellow-500 text-sm tracking-tight">{renderStars()}</span>
                </div>
            </div>
        </div>
    );
};

export default Book;