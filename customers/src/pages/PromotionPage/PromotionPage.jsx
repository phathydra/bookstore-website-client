import React, { useState, useEffect } from "react";
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

  // Banner tùy chỉnh hoặc mặc định (tông xanh sang trọng)
  const bannerImage =
    location.state?.bannerImage ||
    "https://images.unsplash.com/photo-1507842217121-9d59630c13e9?q=80&w=1920&auto=format&fit=crop";
  const bannerTitle = location.state?.bannerTitle || "Ưu Đãi Đặc Biệt";

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAllPromotionData = async () => {
      setLoading(true);
      try {
        // 1. Lấy voucher đang publish
        const voucherReq = axiosClient.get(`${ORDER_API_URL}/vouchers`, {
          params: { page: 0, size: 10, publish: true },
        });

        // 2. Lấy sách flash sale
        const flashSaleReq = axiosClient.get("/discounts/flash-sales/books", {
          params: { page: 0, size: 10 },
        });

        // 3. Lấy sách đang giảm giá
        const discountReq = axiosClient.get("/book/discounted_books", {
          params: { page: 0, size: 20 },
        });

        const [voucherRes, flashSaleRes, discountRes] = await Promise.allSettled([
          voucherReq,
          flashSaleReq,
          discountReq,
        ]);

        if (voucherRes.status === "fulfilled") {
          setVouchers(voucherRes.value.data.content || []);
        }

        if (flashSaleRes.status === "fulfilled") {
          const fsData = flashSaleRes.value.data.content || [];
          const mappedFS = fsData.map((b) => ({
            ...b,
            discountType: "FLASH_SALE",
          }));
          setFlashSaleBooks(mappedFS);
        }

        if (discountRes.status === "fulfilled") {
          setDiscountedBooks(discountRes.value.data.content || []);
        }
      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu khuyến mãi:", error);
        toast.error("Không thể tải dữ liệu khuyến mãi. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPromotionData();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] font-sans pb-20">
      {/* --- 1. BANNER HEADER (Sang trọng, tông xanh chủ đạo) --- */}
      <div className="relative w-full h-[380px] overflow-hidden shadow-lg">
        <img
          src={bannerImage}
          alt={bannerTitle}
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A5D76]/90 via-[#2A5D76]/60 to-transparent flex flex-col justify-center px-8 md:px-20">
          <div className="flex items-center gap-3 mb-4 text-white/80 uppercase tracking-widest text-sm font-semibold">
            <FaBookOpen className="text-xl" />
            Thư viện ưu đãi
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl tracking-tight">
            {bannerTitle}
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl border-l-4 border-[#FFD700] pl-6">
            Săn voucher độc quyền, flash sale chớp nhoáng và hàng ngàn sách giảm giá sâu!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        {/* --- 2. KHO VOUCHER --- */}
        {vouchers.length > 0 && (
          <section className="mb-16 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#2A5D76] p-3 rounded-xl text-white shadow-md">
                <FaTicketAlt className="text-3xl" />
              </div>
              <h2 className="text-3xl font-bold text-[#2A5D76] uppercase tracking-wide">
                Kho Voucher Độc Quyền
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 flex"
                >
                  {/* Phần trái: Giá trị giảm giá */}
                  <div className="w-32 bg-gradient-to-br from-[#2A5D76] to-[#4A89A8] flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 -skew-x-12"></div>
                    <span className="text-4xl font-extrabold z-10">
                      {voucher.discountPercent
                        ? `${voucher.discountPercent}%`
                        : "GIẢM"}
                    </span>
                    <span className="text-sm uppercase tracking-wider z-10 mt-1">
                      {voucher.discountPercent ? "OFF" : "GIÁ TRỊ"}
                    </span>
                  </div>

                  {/* Phần phải: Thông tin voucher */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-[#2A5D76] text-xl tracking-tight">
                          {voucher.code}
                        </h3>
                        <span className="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-bold">
                          HOT
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {voucher.description || "Áp dụng cho mọi đơn hàng"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-gray-300 flex justify-between items-end">
                      <p className="text-xs text-gray-500">
                        Hết hạn: {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                      </p>
                      <button
                        onClick={() => handleCopyCode(voucher.code)}
                        className="bg-[#2A5D76] hover:bg-[#1e4459] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-md"
                      >
                        <FaCopy />
                        Sao chép
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- LOADING --- */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2A5D76]"></div>
          </div>
        ) : (
          <>
            {/* --- 3. FLASH SALE SECTION --- */}
            {flashSaleBooks.length > 0 && (
              <section className="mb-16">
                <div className="bg-gradient-to-r from-[#2A5D76] to-[#4A89A8] rounded-3xl p-8 md:p-12 text-white shadow-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm animate-pulse">
                        <FaBolt className="text-[#FFD700] text-4xl" />
                      </div>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">
                          Flash Sale Giờ Vàng
                        </h2>
                        <p className="text-white/80 mt-1 text-lg">
                          Giảm giá sốc – Chỉ diễn ra trong thời gian giới hạn!
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm font-bold text-lg border border-white/30">
                      ĐANG DIỄN RA 🔥
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {flashSaleBooks.map((book) => (
                      <div
                        key={book.bookId}
                        className="transform hover:-translate-y-2 transition-transform duration-300"
                      >
                        <Book book={book} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* --- 4. SÁCH ĐANG GIẢM GIÁ --- */}
            <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
              <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-4">
                  <FaTags className="text-[#E67E22] text-4xl" />
                  <h2 className="text-3xl font-bold text-[#2A5D76]">
                    Sách Đang Giảm Giá Mạnh
                  </h2>
                </div>
                <a
                  href="/products"
                  className="text-[#4A89A8] font-semibold hover:underline text-lg"
                >
                  Xem tất cả →
                </a>
              </div>

              {discountedBooks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {discountedBooks.map((book) => (
                    <div
                      key={book.bookId}
                      className="transform hover:scale-105 transition-transform duration-300"
                    >
                      <Book book={book} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl">
                  <FaBookOpen className="text-6xl mx-auto mb-4 opacity-40" />
                  <p className="text-lg">
                    Hiện chưa có thêm chương trình giảm giá nào khác.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Decorative bottom bar */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#2A5D76] via-[#4A89A8] to-[#2A5D76] z-50"></div>
    </div>
  );
};

export default PromotionPage;