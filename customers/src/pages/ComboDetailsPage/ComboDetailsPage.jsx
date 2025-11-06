import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComboById } from '../combo/comboService';
import { getBookDetailsByIds } from '../combo/bookService';
import axios from 'axios'; // Đã có sẵn

// Giả sử bạn có hook giỏ hàng
// import { useCart } from '../../context/CartContext'; 

const ComboDetailsPage = () => {
  const { comboId } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  // const { addItem } = useCart(); // Lấy hàm thêm vào giỏ hàng

  const [combo, setCombo] = useState(null);
  const [books, setBooks] = useState([]); // State này sẽ giữ sách đã được "làm giàu" (enrich)
  const [prices, setPrices] = useState({
    originalTotal: 0,
    discountAmount: 0,
    finalPrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComboData = async () => {
      if (!comboId) return;

      try {
        setLoading(true);
        // 1. Lấy chi tiết Combo
        const comboResponse = await getComboById(comboId);
        const comboData = comboResponse.data;
        setCombo(comboData);

        if (comboData.bookIds && comboData.bookIds.length > 0) {
          // 2. Lấy chi tiết các sách trong Combo (dữ liệu cơ bản)
          const booksResponse = await getBookDetailsByIds(comboData.bookIds);
          const booksData = booksResponse.data; // Đây là mảng sách gốc

          // 3. (CẬP NHẬT) Lấy dữ liệu bổ sung (giống Book.jsx)
          
          // Lấy top-selling (1 lần gọi)
          const topSellingRes = await axios.get("http://localhost:8082/api/orders/top-selling");
          const topSellingBooks = topSellingRes.data;

          // Lặp qua từng sách để lấy analytics và reviews
          const enrichedBooksData = await Promise.all(
            booksData.map(async (book) => {
              let rating = 0;
              let purchaseCount = 0;
              let viewCount = 0; // Thêm luôn viewCount nếu muốn

              // Lấy Reviews (để tính rating)
              try {
                const reviewRes = await axios.get(`http://localhost:8081/api/reviews/book/${book.bookId}`);
                const reviews = reviewRes.data;
                if (Array.isArray(reviews) && reviews.length > 0) {
                  const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
                  rating = total / reviews.length;
                }
              } catch (e) {
                console.error("Lỗi lấy reviews:", e);
              }
              
              // Lấy Analytics (nếu cần view count)
              try {
                const analyticsRes = await axios.get(`http://localhost:8081/api/analytics/${book.bookId}`);
                viewCount = analyticsRes.data.viewCount || 0;
              } catch (e) {
                console.error("Lỗi lấy analytics:", e);
              }

              // Lấy purchaseCount (từ top-selling đã gọi)
              const foundBook = topSellingBooks.find(item => item.bookId === book.bookId);
              purchaseCount = foundBook ? foundBook.totalSold : 0; // Giống logic Book.jsx

              // Trả về object sách đã "làm giàu"
              return {
                ...book,
                rating,
                purchaseCount,
                viewCount
              };
            })
          );
          
          setBooks(enrichedBooksData); // Set mảng sách đã có đủ thông tin

          // 4. Tính toán giá (dùng mảng booksData gốc)
          // (CẬP NHẬT) Truyền mảng sách đã "làm giàu" vào tính giá
          // để đảm bảo dùng đúng trường "bookPrice"
          calculatePrices(comboData, enrichedBooksData);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết combo:", err);
        setError("Không tìm thấy combo này.");
      } finally {
        setLoading(false);
      }
    };

    fetchComboData();
  }, [comboId]);

  // Hàm tính toán giá (sử dụng book.price từ API)
  const calculatePrices = (comboData, booksData) => {
    // Dùng `book.bookPrice` (giống Book.jsx) hoặc `book.price`
    const originalTotal = booksData.reduce((sum, book) => sum + (book.bookPrice || book.price || 0), 0);

    let discountAmount = 0;
    if (comboData.discountType === "PERCENT") {
      discountAmount = originalTotal * (comboData.discountValue / 100);
    } else {
      discountAmount = comboData.discountValue;
    }

    // Đảm bảo giảm giá không nhiều hơn giá gốc
    discountAmount = Math.min(discountAmount, originalTotal);
    
    const finalPrice = originalTotal - discountAmount;

    setPrices({ originalTotal, discountAmount, finalPrice });
  };

  // 
  // === (THAY THẾ HÀM NÀY) ===
  //
  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!combo || !books.length) return;

    // 1. Kiểm tra đăng nhập (giống code tham khảo)
    const accountId = localStorage.getItem("accountId");
    if (!accountId) {
      alert("Bạn cần đăng nhập để thêm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    // 2. Kiểm tra tồn kho của TẤT CẢ sách trong combo
    // Dùng `book.bookStockQuantity` giống code tham khảo
    const outOfStockBook = books.find(book => (book.bookStockQuantity || 0) <= 0);
    if (outOfStockBook) {
      alert(`Sách "${outOfStockBook.bookName}" trong combo này đã hết hàng!`);
      return;
    }

    // 3. Map mảng 'books' thành 'cartItems' payload
    // Dựa theo cấu trúc của `addToCartService` trong code tham khảo
    const cartItems = books.map(book => ({
      bookId: book.bookId,
      bookName: book.bookName,
      // Dùng `book.bookPrice` (giá gốc) và `book.discountedPrice`
      price: parseFloat(book.bookPrice || book.price),
      discountedPrice: book.discountedPrice
        ? parseFloat(book.discountedPrice)
        : null,
      percentage: book.percentage || 0,
      quantity: 1, // Mỗi sách trong combo thêm 1 cuốn
      bookImage: book.bookImages?.[0] || book.bookImage || 'https://via.placeholder.com/150',
    }));

    // 4. Gọi API giỏ hàng (giống code tham khảo)
    // Dùng trực tiếp axios.post vì API `/cart/add` hỗ trợ mảng cartItems
    const API_CART_URL = "http://localhost:8082/cart/add"; // Từ `API_URLS.CART`

    try {
      const payload = {
        accountId,
        cartItems, // Gửi mảng các sách
      };

      await axios.post(API_CART_URL, payload);

      alert(`Đã thêm ${books.length} sách từ combo "${combo.name}" vào giỏ hàng!`);
      navigate("/cart"); // Chuyển đến giỏ hàng

    } catch (err) {
      console.error("Lỗi khi thêm combo vào giỏ hàng:", err.response?.data || err.message);
      alert("Có lỗi xảy ra khi thêm combo vào giỏ hàng. Vui lòng thử lại!");
    }
  };
  //
  // === (KẾT THÚC THAY THẾ) ===
  //

  // (THÊM MỚI) Hàm render sao (từ Book.jsx)
  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  };

  // Hàm định dạng tiền (ví dụ)
  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // ==== PHẦN RENDER (UI) ====

  if (loading) {
    return <div className="p-10 text-center">Đang tải chi tiết combo...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  if (!combo) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
        &larr; Quay lại
      </button>

      {/* Chi tiết Combo (Giữ nguyên) */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-green-700">{combo.name}</h1>
        <p className="text-gray-600 mt-2">{combo.description}</p>
        <div className="mt-4">
          <span className="text-lg font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
            {combo.discountType === "PERCENT"
              ? `Giảm ${combo.discountValue}%`
              : `Giảm ${formatPrice(combo.discountValue)}`}
          </span>
        </div>
      </div>

      {/* Danh sách sách và Tổng giá */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột danh sách sách (CẬP NHẬT JSX) */}
        <div className="md:col-span-2 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Các sách trong combo ({books.length} sách)</h2>
          <div className="space-y-4">
            {books.map((book) => (
              <div key={book.bookId} className="flex items-center border-b pb-4">
                <img
                  src={book.bookImages?.[0] || 'https://via.placeholder.com/100x150'}
                  alt={book.bookName}
                  className="w-20 h-28 object-cover rounded shadow mr-4"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{book.bookName}</h3>
                  <p className="text-gray-500 text-sm">Tác giả: {book.authorName || 'N/A'}</p>
                  
                  {/* (CẬP NHẬT) Hiển thị giá và chi tiết phụ */}
                  {/* Sử dụng book.bookPrice hoặc book.price */}
                  <p className="text-red-600 font-medium">{formatPrice(book.bookPrice || book.price)}</p>
                  
                  <div className="text-sm font-light text-gray-500 flex items-center justify-between w-full mt-1">
                    <span>Đã bán: {book.purchaseCount || 0}</span>
                    <span className="text-yellow-500 text-sm tracking-tight">
                      {renderStars(book.rating)}
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột Tổng giá và Thêm vào giỏ hàng */}
        <div className="md:col-span-1">
          <div className="bg-white shadow-lg rounded-lg p-6 sticky top-4">
            <h2 className="text-2xl font-semibold mb-4">Giá trọn gói</h2>
            <div className="space-y-2 text-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng giá gốc:</span>
                <span className="line-through">{formatPrice(prices.originalTotal)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="font-medium">Tiết kiệm:</span>
                <span className="font-medium">-{formatPrice(prices.discountAmount)}</span>
              </div>
              <hr className="my-2"/>
              <div className="flex justify-between text-red-600 text-2xl font-bold">
                <span>Chỉ còn:</span>
                <span>{formatPrice(prices.finalPrice)}</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-6 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg
                         hover:bg-red-700 transition duration-200"
            >
              {/* (CẬP NHẬT) Sửa lại tên nút cho rõ nghĩa */}
              Thêm các sách vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboDetailsPage;