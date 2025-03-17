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
            className="flex flex-col items-start m-2 p-3 h-80 w-56 border border-gray-300 rounded-xl bg-white text-gray-800 shadow-md transition-transform duration-200 transform hover:translate-y-1 hover:shadow-lg cursor-pointer"
            onClick={handleSelect}
        >
            {/* Tăng khoảng cách giữa ảnh và giá bằng mb-3 */}
            <div className="w-full h-48 overflow-hidden mb-3">
                <img
                    className="w-full h-full object-cover"
                    src={book.bookImage}
                    alt={book.bookName}
                />
            </div>

            {/* Giữ khoảng cách hợp lý cho tên sách */}
            <div className="flex flex-col items-start flex-grow w-full text-left">
                <div className="text-lg font-bold text-gray-800 max-h-12 overflow-hidden overflow-ellipsis line-clamp-2">
                    {book.bookName}
                </div>
            </div>

            {/* Phần giá và số lượng */}
            <div className="flex flex-col items-start w-full pt-2 space-y-1">
                <div className="text-lg font-semibold text-red-600">{book.bookPrice} VND</div>
                <div className="text-sm font-light text-gray-500">Còn: {book.bookStockQuantity} quyển</div>
            </div>
        </div>
    );
};

export default Book;
