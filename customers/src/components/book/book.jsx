import React from "react";
import { useNavigate } from "react-router-dom";

const Book = ({ book }) => {
    const navigate = useNavigate();

    const handleSelect = () => {
        if (!book || !book.bookId) {
            console.error("Lỗi: ID sách không hợp lệ", book);
            return;
        }
        navigate(`/productdetail/${book.bookId}`);
    };

    return (
        <div
            className="relative flex flex-col items-start m-2 p-3 h-80 w-56 rounded-sm bg-white text-gray-800 transition-transform duration-200 transform hover:translate-y-1 hover:shadow-lg cursor-pointer"
            onClick={handleSelect}
        >
            {/* Nhãn dán "Cháy hàng" */}
            {book.bookStockQuantity === 0 && (
                <div className="absolute top-9 right-10 transform rotate-[-20deg] bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-sm shadow-md">
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

            {/* Giá và số lượng */}
            <div className="flex flex-col items-start w-full pt-2 space-y-1">
                {book.percentage > 0 ? (
                    <div className="flex items-center space-x-2">
                        <div className="text-lg font-semibold text-red-600">
                            {book.discountedPrice.toLocaleString()} VND
                        </div>
                        <div className="!ml-2 px-2 py-1 text-sm font-bold text-white bg-green-700 rounded-lg">
                            -{book.percentage}%
                        </div>
                    </div>
                ) : (
                    <div className="text-lg font-semibold text-gray-800">
                        {book.bookPrice.toLocaleString()} VND
                    </div>
                )}
                {book.percentage > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                        {book.bookPrice.toLocaleString()} VND
                    </div>
                )}
                <div className="text-sm font-light text-gray-500">
                    Còn: {book.bookStockQuantity} quyển
                </div>
            </div>
        </div>
    );
};

export default Book;
