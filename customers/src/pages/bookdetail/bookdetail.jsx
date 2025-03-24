import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");

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
                openModal("Không thể tải dữ liệu sách.");
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

    const handleIncrease = () => {
        if (book && quantity < book.bookStockQuantity) {
            setQuantity((prev) => prev + 1);
        }
    };

    const handleDecrease = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

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
            cartItems: [{
                bookId: book.bookId,
                bookName: book.bookName,
                price: parseFloat(book.bookPrice),
                quantity: quantity,
                bookImage: book.bookImage
            }]
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

    const openModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handlePolicyClick = (policy) => {
        switch (policy) {
            case "Thời gian giao hàng":
                openModal("Thông tin đóng gói, vận chuyển hàng\n\nVới đa phần đơn hàng, Fahasa.com cần vài giờ làm việc để kiểm tra thông tin và đóng gói hàng. Nếu các sản phẩm đều có sẵn hàng, Fahasa.com sẽ nhanh chóng bàn giao cho đối tác vận chuyển. Nếu đơn hàng có sản phẩm sắp phát hành, Fahasa.com sẽ ưu tiên giao những sản phẩm có hàng trước cho Quý khách hàng.");
                break;
            case "Chính sách đổi trả":
                openModal("Đổi trả miễn phí toàn quốc\n\nSản phẩm có thể được đổi trả miễn phí nếu có lỗi từ nhà sản xuất.");
                break;
            case "Chính sách khách sỉ":
                openModal("Ưu đãi khi mua số lượng lớn\n\nFahasa.com cung cấp ưu đãi đặc biệt cho khách hàng mua hàng số lượng lớn.");
                break;
            default:
                break;
        }
    };

    if (loading) return <div className="text-center py-10 text-lg">Đang tải...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!book) return <div className="text-center py-10 text-gray-600">Sách không tồn tại.</div>;

    return (
        <div className="container mx-auto !px-4 !py-6">
            <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden border p-5">
                <div className="md:w-1/3 flex flex-col items-center">
                    <img src={book.bookImage} alt={book.bookName} className="w-72 h-auto rounded-lg shadow-md" />

                    <div className="flex items-center !space-x-2 mt-4">
                        <div className="flex items-center bg-white border-2 !border-gray-500 rounded-xl px-3 py-2 text-lg font-semibold w-[140px] h-14 justify-between">
                            <button onClick={handleDecrease} className="px-2 py-1 text-black">-</button>
                            <span className="px-4">{quantity}</span>
                            <button onClick={handleIncrease} className="px-2 py-1 text-black">+</button>
                        </div>


                        <button
                            className="px-6 py-3 bg-green-700 text-white text-lg !font-semibold !rounded-xl hover:scale-105 hover:bg-green-800 transition shadow-md hover:shadow-lg !pl-4 !pr-4"
                            onClick={addToCart}
                        >
                            Thêm vào 
                        </button>

                    </div>

                    <div className="!mt-4 !p-4 bg-gray-100 !rounded-lg text-gray-700 text-sm">
                        <h3 className="font-semibold text-base">Chính sách mua hàng</h3>
                        <div className="space-y-2">
                            <button onClick={() => handlePolicyClick("Thời gian giao hàng")} className="text-blue-600 !text-start">Thời gian giao hàng: Giao nhanh và uy tín</button>
                            <button onClick={() => handlePolicyClick("Chính sách đổi trả")} className="text-blue-600 !text-start">Chính sách đổi trả: Đổi trả miễn phí toàn quốc</button>
                            <button onClick={() => handlePolicyClick("Chính sách khách sỉ")} className="text-blue-600 !text-start">Chính sách khách sỉ: Ưu đãi khi mua số lượng lớn</button>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block border-l-2 border-gray-300 mx-4"></div>

                <div className="md:w-2/3 p-5">
                    <div className="w-full">
                        <h2 className="!text-2xl font-bold text-gray-800 mb-2 w-full !text-left">{book.bookName}</h2>
                        {book.percentage > 0 ? (
                            <div className="flex flex-col items-start">
                                <div className="text-2xl font-bold text-red-600">
                                    {book.discountedPrice.toLocaleString()} VNĐ
                                </div>
                                <div className="text-lg text-gray-500 line-through">
                                    {book.bookPrice.toLocaleString()} VNĐ
                                </div>
                                <div className="text-lg font-semibold text-green-600">
                                    -{book.percentage}%
                                </div>
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-gray-800">
                                {book.bookPrice.toLocaleString()} VNĐ
                            </div>
                        )}

                        <p className="!text-lg mb-2 flex items-center">
                            <span className="px-2 py-1 bg-blue-400 text-white rounded-lg font-semibold text-lg min-w-[720px] text-center">
                                {`${book.bookStockQuantity} sản phẩm còn`}
                            </span>
                        </p>

                        <hr className="my-4 border-gray-300" />

                        <p className="text-lg text-gray-800 mb-2"><strong>THÔNG TIN CHI TIẾT</strong></p>
                        <p className="text-base text-gray-600 mb-2"><strong>Tác giả:</strong> <Link to={`/products?bookAuthor=${book.bookAuthor}`} className="text-blue-600 underline">{book.bookAuthor}</Link></p>
                        <p className="text-base text-gray-600 mb-2"><strong>Nhà xuất bản:</strong> <Link to={`/products?bookPublisher=${book.bookPublisher}`} className="text-blue-600 underline">{book.bookPublisher}</Link></p>
                        <p className="text-base text-gray-600 mb-2"><strong>Năm xuất bản:</strong> {book.bookYearOfProduction}</p>
                        <p className="text-base text-gray-600 mb-2"><strong>Ngôn ngữ:</strong> {book.bookLanguage}</p>
                        <p className="text-base text-gray-600 mb-2"><strong>Thể loại:</strong> {book.bookCategory}</p>
                        <p className="text-base text-gray-600 mb-2"><strong>Nhà cung cấp:</strong> <Link to={`/products?bookSupplier=${book.bookSupplier}`} className="text-blue-600 underline">{book.bookSupplier}</Link></p>

                        <hr className="my-4 border-gray-300" />
                        <div className="mt-5">
                            <h3 className="text-xl font-semibold border-b pb-2">MÔ TẢ SÁCH</h3>
                            <p className="text-base text-gray-600 mt-4" style={{ textAlign: "justify" }}>
                                {book.bookDescription}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold border-b pb-2">GIỚI THIỆU CHO BẠN</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {recommendedBooks.length > 0 ? (
                        recommendedBooks.map((recBook) => (
                            <Link key={recBook.bookId} to={`/productdetail/${recBook.bookId}`} className="block bg-white shadow-lg rounded-lg overflow-hidden p-4 border">
                                <img src={recBook.bookImage} alt={recBook.bookName} className="w-full h-52 object-cover rounded-lg" />
                                <p className="mt-2 text-center text-base font-semibold text-gray-700">{recBook.bookName}</p>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500">Không có sách đề xuất.</p>
                    )}
                </div>
            </div>
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 h-96 overflow-hidden relative">
                        {/* Nút đóng lớn hơn */}
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-3xl font-bold"
                        >
                            &times;
                        </button>

                        {/* Tiêu đề */}
                        <h2 className="text-2xl font-bold text-center mb-4">Thời gian giao hàng</h2>

                        {/* Nội dung có khoảng cách lề trái phải, thanh cuộn, và căn đều 2 lề */}
                        <div className="overflow-y-auto h-[80%] !pr-4 !pl-4 text-justify">
                            <p>{modalContent}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDetail;