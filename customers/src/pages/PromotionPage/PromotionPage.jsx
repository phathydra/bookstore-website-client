import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom"; 
import { FaTicketAlt, FaStar, FaCopy } from "react-icons/fa"; // Thêm icon Copy
import Book from "../../components/book/book"; 

const PromotionPage = () => {
  // --- STATE ---
  const [promotionBooks, setPromotionBooks] = useState([]);
  const [vouchers, setVouchers] = useState([]); // ⬅️ Thêm state lưu voucher
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingVouchers, setLoadingVouchers] = useState(true); // ⬅️ Thêm loading cho voucher

  // Lấy dữ liệu từ state được truyền qua (Banner)
  const location = useLocation();
  const bannerImage = location.state?.bannerImage || "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=1920&auto=format&fit=crop";
  const bannerTitle = location.state?.bannerTitle || "Chương trình khuyến mãi";

  // --- EFFECT ---
  useEffect(() => {
    fetchPromotionBooks();
    fetchActiveVouchers(); // ⬅️ Gọi hàm lấy voucher
  }, []);

  // --- API CALLS ---
  const fetchPromotionBooks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/book/discounted_books?page=0&size=10"
      );
      const data = response.data.content || response.data;
      setPromotionBooks(data);
    } catch (error) {
      console.error("❌ Lỗi khi tải sách khuyến mãi:", error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchActiveVouchers = async () => {
    try {
      // Gọi API lấy voucher đang active từ Backend của bạn
      const response = await axios.get("http://localhost:8081/api/discounts/active?page=0&size=8");
      const data = response.data.content || response.data;
      setVouchers(data);
    } catch (error) {
      console.error("❌ Lỗi khi tải voucher:", error);
    } finally {
      setLoadingVouchers(false);
    }
  };

  // --- HANDLER ---
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
  };

  // --- RENDER HELPERS ---
  // Hàm format hiển thị giảm giá (VND hoặc %)
  const formatDiscount = (voucher) => {
    if (voucher.discountType === "PERCENT") {
      return `Giảm ${voucher.discountValue}%`;
    }
    // Giả sử discountValue là số tiền (ví dụ 50000)
    return `Giảm ${(voucher.discountValue / 1000)}K`; 
  };

  return (
    <div className="min-h-screen bg-[#D60019] font-sans"> 
      
      {/* 1. HEADER BANNER SECTION */}
      <div className="w-full relative">
        <img 
          src={bannerImage} 
          alt={bannerTitle} 
          className="w-full h-auto object-cover max-h-[500px]"
        />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-b from-black/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* ================================================================= */}
        {/* 2. VOUCHER LIST SECTION (MỚI THÊM) */}
        {/* ================================================================= */}
        <div className="mb-12">
            <h2 className="text-white text-3xl font-bold text-center mb-8 uppercase drop-shadow-md flex items-center justify-center gap-2">
                <FaTicketAlt className="text-yellow-300"/> Săn Voucher Ưu Đãi <FaTicketAlt className="text-yellow-300"/>
            </h2>
            
            {loadingVouchers ? (
               <div className="text-center text-white/80">Đang tải mã giảm giá...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {vouchers.length > 0 ? (
                        vouchers.map((voucher) => (
                            <div key={voucher.id || voucher.code} className="bg-white rounded-xl overflow-hidden shadow-lg flex flex-col relative group hover:-translate-y-1 transition-transform duration-300">
                                {/* Trang trí răng cưa bên trái (CSS border) */}
                                <div className="border-l-[6px] border-[#D60019] border-dotted h-full p-4 flex flex-col justify-between relative">
                                    
                                    {/* Nội dung Voucher */}
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div className="text-[#D60019] font-black text-2xl">
                                                {formatDiscount(voucher)}
                                            </div>
                                            <div className="bg-yellow-100 text-yellow-700 p-1 rounded-full">
                                                <FaTicketAlt className="text-sm"/>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2">
                                            <p className="text-gray-700 font-bold text-sm">
                                                Mã: <span className="bg-gray-100 px-1 rounded text-gray-900">{voucher.code}</span>
                                            </p>
                                            {/* Logic hiển thị điều kiện đơn hàng tối thiểu (nếu có) */}
                                            {/* Ví dụ: voucher.minOrderValue */}
                                            <p className="text-gray-500 text-xs mt-1">
                                                {voucher.description || "Áp dụng cho toàn bộ sản phẩm"}
                                            </p>
                                            <p className="text-blue-500 text-xs mt-2 font-medium">
                                                HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Nút Hành động */}
                                    <div className="mt-4 flex gap-2">
                                        <button 
                                            onClick={() => handleCopyCode(voucher.code)}
                                            className="flex-1 bg-white border border-[#0066CC] text-[#0066CC] hover:bg-blue-50 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1"
                                        >
                                            <FaCopy/> Copy
                                        </button>
                                        <button className="flex-1 bg-[#0066CC] hover:bg-[#0052a3] text-white py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm">
                                            Lưu Mã
                                        </button>
                                    </div>

                                    {/* Trang trí hình tròn khuyết 2 bên (tạo hiệu ứng vé) */}
                                    <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#D60019] rounded-full"></div>
                                    <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#D60019] rounded-full"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-white/70 italic">
                            Hiện chưa có mã giảm giá nào.
                        </div>
                    )}
                </div>
            )}
        </div>
        {/* ================================================================= */}


        {/* 3. PRODUCT LIST SECTION */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl mt-8">
            <div className="flex items-center gap-3 mb-6">
                 <FaStar className="text-yellow-400 text-3xl" />
                 <h2 className="text-[#D60019] text-2xl font-bold uppercase">Deal Lung Linh - Đồng Giá</h2>
            </div>

            {loadingBooks ? (
                <div className="text-center py-10 text-gray-500">Đang tải danh sách sách khuyến mãi...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"> 
                    {promotionBooks.length > 0 ? (
                        promotionBooks.map((book) => (
                            <div key={book.bookId || book.id} className="transform hover:scale-105 transition-transform duration-300">
                                <Book book={book} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-500">Không có sách khuyến mãi nào.</div>
                    )}
                </div>
            )}
        </div>
      </div>
      
      {/* Footer Decoration */}
      <div className="h-20 bg-[#a30013] mt-8 flex items-center justify-center text-white/50 text-sm">
        Designed for BookStore Promotion Campaign
      </div>
    </div>
  );
};

export default PromotionPage;