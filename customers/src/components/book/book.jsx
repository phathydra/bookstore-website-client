import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, ORDER_API_URL } from "../../api/axiosClient"; 

const Book = React.memo(({ book }) => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    viewCount: 0,
    purchaseCount: 0,
    rating: 0,
    isLoading: true,
  });

  // --- 1. LOGIC LẤY DỮ LIỆU ---
  useEffect(() => {
    if (!book || !book.bookId) return;

    const fetchDetailStats = async () => {
      try {
        const [analyticsRes, topSellingRes, reviewRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/analytics/${book.bookId}`),
          axios.get(`${ORDER_API_URL}/orders/top-selling`),
          axios.get(`${API_BASE_URL}/reviews/book/${book.bookId}`)
        ]);

        let newViewCount = 0;
        let newPurchaseCount = 0; 
        let newRating = 5;

        // Ưu tiên 1: Analytics
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data) {
          const data = analyticsRes.value.data;
          newViewCount = data.viewCount || 0;
          if (data.purchaseCount) newPurchaseCount = data.purchaseCount; 
        }

        // Ưu tiên 2: Top Selling
        if (newPurchaseCount === 0 && topSellingRes.status === 'fulfilled') {
          const topList = topSellingRes.value.data;
          const found = Array.isArray(topList) ? topList.find(i => i.bookId === book.bookId) : null;
          if (found) newPurchaseCount = found.totalSold;
        }

        // Ưu tiên 3: Props
        if (newPurchaseCount === 0 && (book.quantitySold || book.totalSold)) {
            newPurchaseCount = book.quantitySold || book.totalSold;
        }

        // Rating
        if (reviewRes.status === 'fulfilled') {
          const reviews = reviewRes.value.data;
          if (Array.isArray(reviews) && reviews.length > 0) {
            const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            newRating = total / reviews.length;
          }
        }

        setStats({
          viewCount: newViewCount,
          purchaseCount: newPurchaseCount,
          rating: newRating,
          isLoading: false
        });

      } catch (error) {
        console.error("Lỗi tải data sách:", error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchDetailStats();
  }, [book.bookId, book.quantitySold, book.totalSold]);


  // --- 2. XỬ LÝ CLICK ---
  const handleSelect = () => {
    if (!book || !book.bookId) return;

    setStats(prev => ({...prev, viewCount: prev.viewCount + 1}));

    const token = localStorage.getItem("token");
    const sessionId = sessionStorage.getItem("sessionId");
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (sessionId) headers['X-Session-ID'] = sessionId;

    fetch(`${API_BASE_URL}/analytics/${book.bookId}/view`, {
        method: 'POST',
        headers: headers,
        keepalive: true 
    }).catch(err => console.error("Tracking error:", err));

    navigate(`/productdetail/${book.bookId}`);
  };

  const renderStars = () => {
    const rounded = Math.round(stats.rating || 5);
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
  };

  const displayImage = Array.isArray(book.bookImages) && book.bookImages.length > 0
    ? book.bookImages[0]
    : book.bookImage;

  const hasDiscount = book.percentage > 0;
  const finalPrice = book.discountedPrice || (hasDiscount 
    ? Math.round(book.bookPrice * (1 - book.percentage / 100)) 
    : book.bookPrice);

  const isOutOfStock = book.bookStockQuantity === 0;

  return (
    <div
      onClick={handleSelect} 
      className={`relative flex flex-col items-start m-2 p-3 h-80 w-56 rounded-xl bg-white text-gray-800 transition-all duration-300 transform border border-transparent 
        ${isOutOfStock ? 'opacity-90 grayscale-[30%]' : 'hover:translate-y-1 hover:shadow-xl hover:border-gray-200 cursor-pointer'}
      `}
    >
      {/* Icon Mắt */}
      <div className="absolute top-3 right-3 text-[10px] font-bold text-gray-500 z-10 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-gray-100 flex items-center gap-1 backdrop-blur-sm">
        <span>👁</span>
        <span>{stats.isLoading ? "..." : stats.viewCount}</span>
      </div>

      {/* --- PHẦN HÌNH ẢNH (ĐÃ SỬA CĂN CHỈNH) --- */}
      {/* Thêm 'flex items-center justify-center bg-gray-50' để căn giữa và tạo nền sạch */}
      <div className="w-full h-48 mb-3 rounded-lg relative group overflow-hidden flex items-center justify-center bg-gray-50">
        
        {/* Overlay khi hết hàng */}
        {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
                <div className="border border-white/50 px-3 py-1 rounded bg-black/20">
                    <span className="text-white text-xs font-bold uppercase tracking-widest">Hết hàng</span>
                </div>
            </div>
        )}

        {/* Sửa thẻ img:
            - 'object-contain': Hiển thị trọn vẹn ảnh (không cắt)
            - 'max-h-full max-w-full': Đảm bảo ảnh không bị tràn ra ngoài khung
            - 'mix-blend-multiply': (Tùy chọn) Giúp nền trắng của ảnh hòa vào nền xám (nhìn như ảnh trong suốt)
        */}
        <img
          className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
          src={displayImage}
          alt={book.bookName}
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Book'; }}
        />
        
        {/* Nhãn Giảm giá */}
        {hasDiscount && !isOutOfStock && (
             <div className="absolute bottom-0 left-0 bg-[#E67E22] text-white text-[10px] font-bold px-2 py-1 rounded-tr-lg z-10 shadow-sm">
               -{book.percentage}%
             </div>
        )}
      </div>

      {/* Tên sách */}
      <div className="flex flex-col items-start flex-grow w-full text-left px-1">
        <div className="text-base text-gray-800 font-semibold max-h-12 overflow-hidden overflow-ellipsis line-clamp-2 leading-tight min-h-[40px]">
          {book.bookName}
        </div>
      </div>

      {/* Giá và Đã bán */}
      <div className="flex flex-col items-start w-full pt-2 space-y-1 mt-auto px-1 border-t border-dashed border-gray-100">
        {hasDiscount ? (
          <div className="flex flex-col w-full">
            <div className="text-lg font-bold text-[#E67E22]"> 
              {finalPrice.toLocaleString()} đ
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className="line-through">
                {(book.bookPrice || 0).toLocaleString()} đ
              </div>
            </div>
          </div>
        ) : (
          <div className="text-lg font-bold text-[#2A5D76]"> 
            {(book.bookPrice || 0).toLocaleString()} đ
          </div>
        )}

        <div className="text-xs font-medium text-gray-500 flex items-center justify-between w-full h-5 mt-1">
          {stats.isLoading ? (
            <div className="w-2/3 h-3 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              <span>Đã bán: {stats.purchaseCount}</span>
              <span className="text-yellow-400 tracking-tighter ml-1 text-[10px]">
                {renderStars()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default Book;