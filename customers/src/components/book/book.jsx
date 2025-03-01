import React from "react";
import { useNavigate } from "react-router-dom";
import "./book.css";

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
        <div className="book-container" onClick={handleSelect}>
            <div className="book-image-container">
                <img className="book-image" src={book.bookImage} alt={book.bookName} />
            </div>
            <div className="book-details">
                <div className="book-name-text">{book.bookName}</div>
            </div>
            <div className="book-info">
                <div className="book-price-text">{book.bookPrice} VND</div>
                <div className="book-stock-text">Còn: {book.bookStockQuantity} quyển</div>
            </div>
        </div>
    );
};

export default Book;
