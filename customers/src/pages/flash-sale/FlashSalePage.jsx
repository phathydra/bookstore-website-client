import React, { useState, useEffect } from "react";
import { FaBolt, FaClock, FaChevronLeft, FaChevronRight, FaRegSadTear } from "react-icons/fa";

// Import API & Config
import axiosClient from "../../api/axiosClient";

// Import Components
import Book from "../../components/book/book";
import CountdownTimer from "../../components/timer/CountdownTimer";

const FlashSalePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [endTime, setEndTime] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // State lưu thông tin đợt sale để hiển thị
  const [saleInfo, setSaleInfo] = useState({ percent: 0, name: "" });

  const PAGE_SIZE = 20; // Hiển thị nhiều sách hơn trang chủ

  useEffect(() => {
    fetchFlashSaleData();
  }, [page]); // Gọi lại khi đổi trang

  const fetchFlashSaleData = async () => {
    setLoading(true);
    try {
      // 1. Lấy thông tin đợt Flash Sale hiện tại
      const { data: saleData } = await axiosClient.get('/discounts/flash-sales', { 
          params: { page: 0, size: 1 } 
      });

      if (saleData?.content?.length > 0) {
        const currentSale = saleData.content[0];
        const end = new Date(currentSale.endDate);
        const now = new Date();

        // Kiểm tra còn hạn không
        if (end > now) {
          setEndTime(end);
          setSaleInfo({ 
              percent: currentSale.percentage, 
              name: currentSale.name || "Flash Sale Giờ Vàng" 
          });

          // 2. Lấy danh sách sách trong đợt Sale này
          const booksRes = await axiosClient.get('/discounts/flash-sales/books', {
            params: { page: page, size: PAGE_SIZE }
          });

          if (booksRes.data?.content) {
            const fsPercentage = currentSale.percentage;
            
            // Map dữ liệu để Book.jsx hiển thị đúng giá giảm
            const mappedBooks = booksRes.data.content.map(b => ({
              ...b,
              discountType: 'FLASH_SALE',
              percentage: fsPercentage,
              discountedPrice: Math.round(b.bookPrice * (1 - fsPercentage / 100)),
              discountEndDate: currentSale.endDate
            }));

            setBooks(mappedBooks);
            setTotalPages(booksRes.data.totalPages || 1);
          }
        } else {
            // Hết hạn
            setEndTime(null);
            setBooks([]);
        }
      }
    } catch (error) {
      console.error("Lỗi tải trang Flash Sale:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- UI COMPONENTS ---

  const Pagination = () => {
      if (totalPages <= 1) return null;
      return (
          <div className="flex justify-center items-center gap-4 mt-10">
              <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all
                      ${page === 0 
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                          : 'border-[#2A5D76] text-[#2A5D76] hover:bg-[#2A5D76] hover:text-white'}`}
              >
                  <FaChevronLeft /> Trước
              </button>
              <span className="text-[#2A5D76] font-semibold">
                  Trang {page + 1} / {totalPages}
              </span>
              <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all
                      ${page === totalPages - 1 
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                          : 'border-[#2A5D76] text-[#2A5D76] hover:bg-[#2A5D76] hover:text-white'}`}
              >
                  Tiếp <FaChevronRight />
              </button>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] pb-20 font-sans">
      
      {/* --- 1. HEADER BANNER (Gradient Xanh Cổ Vịt) --- */}
      <div className="relative bg-gradient-to-r from-[#1B4353] via-[#2A5D76] to-[#4A89A8] text-white py-12 md:py-16 shadow-lg overflow-hidden">
        {/* Họa tiết trang trí nền (Circles) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-white/5 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            
            {/* Tiêu đề & Icon */}
            <div className="flex items-center justify-center gap-3 mb-4 animate-bounce-slow">
                <FaBolt className="text-[#FFD700] text-4xl md:text-6xl drop-shadow-md" />
                <h1 className="text-4xl md:text-6xl font-extrabold uppercase italic tracking-tighter drop-shadow-lg">
                    Flash Sale
                </h1>
            </div>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 font-light tracking-wide max-w-2xl">
                Cơ hội săn sách giá rẻ nhất trong ngày. Số lượng có hạn, nhanh tay kẻo lỡ!
            </p>

            {/* Đồng hồ đếm ngược to */}
            {endTime ? (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 inline-flex flex-col items-center shadow-2xl">
                    <div className="flex items-center gap-2 text-[#FFD700] mb-2 uppercase text-sm font-bold tracking-widest">
                        <FaClock /> Kết thúc trong
                    </div>
                    <div className="scale-125 md:scale-150 origin-top">
                        <CountdownTimer targetDate={endTime} />
                    </div>
                </div>
            ) : (
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white/80">
                    Chương trình đã kết thúc
                </div>
            )}
        </div>
      </div>

      {/* --- 2. MAIN CONTENT --- */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        
        {/* Thanh filter/info nhỏ */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row justify-between items-center mb-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
                <span className="bg-[#E67E22] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Đang diễn ra</span>
                <span className="text-[#2A5D76] font-semibold">
                    {saleInfo.name} - Giảm đến {saleInfo.percent}%
                </span>
            </div>
            <div className="text-sm text-gray-500">
                Hiển thị {books.length} sản phẩm
            </div>
        </div>

        {/* Danh sách sách */}
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                 <div className="w-12 h-12 border-4 border-[#2A5D76] border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-500">Đang tải deal hot...</p>
             </div>
        ) : books.length > 0 ? (
            <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {books.map((book) => (
                        <div key={book.bookId} className="transform hover:-translate-y-2 transition-transform duration-300">
                            {/* Reuse Book Component */}
                            <Book book={book} />
                            
                            {/* Thanh tiến trình bán chạy (Trang trí thêm cho trang Flash Sale) */}
                            <div className="mt-3 bg-gray-200 rounded-full h-3 relative overflow-hidden mx-1">
                                <div 
                                    className="bg-gradient-to-r from-[#E67E22] to-[#F39C12] h-full absolute top-0 left-0" 
                                    style={{width: `${Math.floor(Math.random() * 40) + 50}%`}} // Fake progress cho đẹp, hoặc lấy từ real data nếu có
                                ></div>
                                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white uppercase shadow-sm">
                                    Sắp hết
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Pagination */}
                <Pagination />
            </>
        ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100 flex flex-col items-center">
                <FaRegSadTear className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Tiếc quá! Không có Flash Sale nào lúc này.</h3>
                <p className="text-gray-500 mb-6">Hãy quay lại sau hoặc khám phá các ưu đãi khác nhé.</p>
                <a 
                    href="/promotion" 
                    className="bg-[#2A5D76] text-white px-6 py-2 rounded-full hover:bg-[#1B4353] transition-colors shadow-lg shadow-[#2A5D76]/30"
                >
                    Xem khuyến mãi khác
                </a>
            </div>
        )}
      </div>
    </div>
  );
};

export default FlashSalePage;