import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./bookdetail.css";

const BookDetail = () => {
    const { id } = useParams(); // Lấy bookId từ URL
    console.log("Book ID from URL:", id); // Debug lỗi

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError("Không có ID sách.");
            setLoading(false);
            return;
        }

        const fetchBook = async () => {
            try {
                const response = await axios.get(`http://localhost:8081/api/book/${id}`);
                setBook(response.data);
            } catch (err) {
                setError("Không thể tải dữ liệu sách.");
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    if (loading) return <div className="book-details-container">Đang tải...</div>;
    if (error) return <div className="book-details-container">{error}</div>;
    if (!book) return <div className="book-details-container">Sách không tồn tại.</div>;

    return (
        <div className="book-details-container">
            <div className="book-card">
                <div className="book-content">
                    <div className="book-image">
                        <img src={book.bookImage} alt={book.bookName} />
                    </div>
                    <div className="book-info">
                        <h2>{book.bookName}</h2>
                        <p><strong>Tác giả:</strong> {book.bookAuthor}</p>
                        <p><strong>Nhà xuất bản:</strong> {book.bookPublisher}</p>
                        <p><strong>Năm xuất bản:</strong> {book.bookYearOfProduction}</p>
                        <p><strong>Ngôn ngữ:</strong> {book.bookLanguage}</p>
                        <p><strong>Thể loại:</strong> {book.bookCategory}</p>
                        <p><strong>Giá:</strong> {book.bookPrice.toLocaleString()} VNĐ</p>
                        <p><strong>Số lượng tồn kho:</strong> {book.bookStockQuantity}</p>
                        <p><strong>Nhà cung cấp:</strong> {book.bookSupplier}</p>
                    </div>
                </div>
                
                <div className="book-description">
                    <h3>Mô tả sách</h3>
                    <p>{book.bookDescription}</p>
                </div>

                {/* Căn giữa nút Thêm vào giỏ hàng */}
                <div className="book-action">
                    <button className="add-to-cart-btn">
                        <span className="cart-icon">🛒</span> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookDetail;
