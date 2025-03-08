import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import axios from "axios";
import "./bookdetail.css";

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // Hook để chuyển trang

    const [book, setBook] = useState(null);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
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

        const fetchRecommendedBooks = async () => {
            try {
                const response = await axios.get(`http://localhost:8081/api/book/${id}/recommendations`);
                setRecommendedBooks(response.data);
            } catch (err) {
                console.error("Lỗi tải sách đề xuất:", err);
            }
        };

        fetchBook();
        fetchRecommendedBooks();
    }, [id]);

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
    
        const cartData = {
            accountId: accountId,
            cartItems: [
                {
                    bookId: book.bookId,
                    bookName: book.bookName,  // Thêm tên sách
                    price: parseFloat(book.bookPrice),  // Thêm giá sách
                    quantity: 1,
                    bookImage: book.bookImage // Thêm ảnh sách
                }
            ]
        };
    
        try {
            const response = await axios.post("http://localhost:8082/cart/add", cartData);
            
            if (response.status === 200) {
                alert("Sách đã được thêm vào giỏ hàng!");
                navigate("/cart");
            } else {
                alert("Thêm vào giỏ hàng thất bại! Hãy thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error.response?.data || error.message);
            alert("Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại!");
        }
    };
    
    
    
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

                <div className="book-action">
                    <button className="add-to-cart-btn" onClick={addToCart}>
                        <span className="cart-icon">🛒</span> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>

            <div className="recommended-books">
                <h3>DÀNH CHO BẠN</h3>
                <div className="recommended-list">
                    {recommendedBooks.length > 0 ? (
                        recommendedBooks.map((recBook) => (
                            <Link key={recBook.bookId} to={`/productdetail/${recBook.bookId}`} className="recommended-card">
                                <img src={recBook.bookImage} alt={recBook.bookName} />
                                <p>{recBook.bookName}</p>
                            </Link>
                        ))
                    ) : (
                        <p>Không có sách đề xuất.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookDetail;
