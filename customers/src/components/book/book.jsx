import React from "react";
import { useNavigate } from "react-router-dom";

const Book = ({ book }) => {
    const navigate = useNavigate();

    const handleSelect = () => {
        if (!book || !book.bookId) {
            console.error("Lỗi: ID sách không hợp lệ", book);
            return;
        }

        navigate(`/productdetail/${book.bookId}`); // Sử dụng book.bookId để điều hướng đúng
    };

    return (
        <div
            className="flex flex-col items-start m-1 p-3 h-80 w-56 border border-gray-300 rounded-xl bg-white text-gray-800 shadow-md transition-transform duration-200 transform hover:translate-y-1 hover:shadow-lg"
            onClick={handleSelect}
        >
            {/* Image container with fixed size */}
            <div className="w-full h-48 overflow-hidden">
                <img
                    className="w-full h-full object-cover"  // This will stretch the image to fit the container
                    src={book.bookImage}
                    alt={book.bookName}
                />
            </div>
            <div className="flex flex-col items-start flex-grow w-full text-left pt-2">
                <div className="text-lg font-bold text-gray-800 mt-2 max-h-10 overflow-hidden overflow-ellipsis line-clamp-2">
                    {book.bookName}
                </div>
            </div>
            <div className="flex flex-col items-start w-full pt-2">
                <div className="text-lg font-normal text-red-600">{book.bookPrice} VND</div>
                <div className="text-sm font-light text-gray-500">Còn: {book.bookStockQuantity} quyển</div>
            </div>
        </div>
    );
};

export default Book;
