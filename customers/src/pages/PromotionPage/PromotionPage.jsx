import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaTicketAlt, FaBolt, FaTags, FaCopy, FaBookOpen } from "react-icons/fa";
import { toast } from "react-toastify";

// Import Component & Config
import Book from "../../components/book/book";
import axiosClient, { ORDER_API_URL } from "../../api/axiosClient";

const PromotionPage = () => {
  const location = useLocation();
  
  // --- STATE ---
  const [vouchers, setVouchers] = useState([]);
  const [flashSaleBooks, setFlashSaleBooks] = useState([]);
  const [discountedBooks, setDiscountedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Banner mặc định màu xanh cho hợp tông
  const bannerImage = location.state?.bannerImage || "https://images.unsplash.com/photo-1507842217121-9d59630c13e9?q=80&w=1920&auto=format&fit=crop";
  const bannerTitle = location.state?.bannerTitle || "Ưu Đãi Đặc Biệt";

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAllPromotionData = async () => {
      setLoading(true);
      try {
        const voucherReq = axios.get(`${ORDER_API_URL}/vouchers`, {
            params: { page: 0, size: 10, publish: true }
        });

        const flashSaleReq = axiosClient.get('/discounts/flash-sales/books', {
            params: { page: 0, size: 10 }
        });

        const discountReq = axiosClient.get('/book/discounted_books', {
            params: { page: 0, size: 20 }
        });

        const [voucherRes, flashSaleRes, discountRes] = await Promise.allSettled([
            voucherReq, flashSaleReq, discountReq
        ]);

        if (voucherRes.status === 'fulfilled') {
            setVouchers(voucherRes.value.data.content || []);
        }

        if (flashSaleRes.status === 'fulfilled') {
            const fsData = flashSaleRes.value.data.content || [];
            const mappedFS = fsData.map(b => ({
                ...b,
                discountType: 'FLASH_SALE',
            }));
            setFlashSaleBooks(mappedFS);
        }

        if (discountRes.status === 'fulfilled') {
            setDiscountedBooks(discountRes.value.data.content || []);
        }

      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu khuyến mãi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPromotionData();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`); 
    // Nếu có toastify: toast.success(`Đã sao chép: ${code}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] font-sans pb-20">
      
      {/* --- 1. BANNER HEADER (Thiết kế lại sang trọng hơn) --- */}
      <div className="relative w-full h-[350px] overflow-hidden shadow-md">
        <img 
          src={bannerImage} 
          alt={bannerTitle} 
          className="w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A5D76]/90 to-transparent flex flex-col justify-center px-8 md:px-20">
            <div className="flex items-center gap-3 mb-2 text-white/80 uppercase tracking-widest text-sm font-semibold">
                <FaBookOpen /> Thư viện ưu đãi
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg tracking-tight">
                {bannerTitle}
            </h1>
            <p className="text-white/90 text-lg max-w-lg border-l-4 border-[#E67E22] pl-4">
                Khám phá kho tàng tri thức với mức giá ưu đãi nhất. Săn voucher và flash sale ngay hôm nay!
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        
        {/* --- 2. KHO VOUCHER (Card thiết kế lại theo tông xanh) --- */}
        {vouchers.length > 0 && (
            <div className="mb-12 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#2A5D76] p-2 rounded-lg text-white">
                        <FaTicketAlt className="text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#2A5D76] uppercase tracking-wide">Kho Voucher</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vouchers.map((voucher) => (
                        <div key={voucher.id} className="group relative flex bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                            {/* Phần trái: Màu xanh logo */}
                            <div className="w-28 bg-[#2A5D76] flex flex-col items-center justify-center text-white p-4 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-white/10 rotate-12 transform scale-150 origin-bottom-left"></div>
                                <span className="font-extrabold text-2xl z-10">{voucher.discountPercent ? `${voucher.discountPercent}%` : 'GIFT'}</span>
                                <span className="text-xs uppercase tracking-wider z-10 opacity-90">OFF</span>
                                {/* Răng cưa trang trí */}
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F4F8FA] rounded-full z-20"></div>
                            </div>
                            
                            {/* Phần phải: Thông tin */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-[#2A5D76] text-lg">{voucher.code}</h3>
                                        <span className="bg-orange-100 text-[#E67E22] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Hot</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{voucher.description || "Áp dụng cho mọi đơn hàng"}</p>
                                </div>
                                <div className="flex justify-between items-end mt-3 border-t border-dashed border-gray-200 pt-2">
                                    <p className="text-xs text-gray-400">HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</p>
                                    <button 
                                        onClick={() => handleCopyCode(voucher.code)}
                                        className="text-[#2A5D76] text-xs font-bold flex items-center hover:bg-[#2A5D76] hover:text-white px-3 py-1.5 rounded-md transition-colors border border-[#2A5D76]"
                                    >
                                        <FaCopy className="mr-1"/> Sao chép
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {loading ? (
             <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A5D76]"></div>
             </div>
        ) : (
            <>
                {/* --- 3. FLASH SALE SECTION (Gradient xanh sang trọng) --- */}
                {flashSaleBooks.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-1 mb-12 border border-[#4A89A8]/20">
                        <div className="bg-gradient-to-r from-[#2A5D76] to-[#4A89A8] rounded-xl p-6 md:p-8 text-white">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                        <FaBolt className="text-[#FFD700] text-2xl animate-pulse" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold uppercase tracking-wider">Flash Sale Giờ Vàng</h2>
                                        <p className="text-white/80 text-sm">Kết thúc sớm, đừng bỏ lỡ!</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm text-sm font-medium border border-white/20">
                                    Đang diễn ra 🔥
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {flashSaleBooks.map((book) => (
                                    <div key={book.bookId} className="transform hover:-translate-y-1 transition-transform duration-300">
                                        <Book book={book} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 4. SÁCH ĐANG GIẢM GIÁ (Nền trắng sạch sẽ) --- */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                            <FaTags className="text-[#E67E22] text-2xl" />
                            <h2 className="text-2xl font-bold text-[#2A5D76]">Đang Giảm Giá</h2>
                        </div>
                        <a href="/category/all" className="text-[#4A89A8] text-sm font-semibold hover:underline">Xem tất cả</a>
                    </div>

                    {discountedBooks.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {discountedBooks.map((book) => (
                                <div key={book.bookId} className="transition-opacity hover:opacity-100">
                                    <Book book={book} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <FaBookOpen className="text-4xl mb-3 opacity-50" />
                            <p>Hiện không có chương trình khuyến mãi nào khác.</p>
                        </div>
                    )}
                </div>
            </>
        )}

      </div>
      
      {/* Decorative Footer Line */}
      <div className="h-2 w-full bg-gradient-to-r from-[#2A5D76] via-[#4A89A8] to-[#2A5D76] fixed bottom-0 left-0 z-50"></div>
    </div>
  );
};

export default PromotionPage;