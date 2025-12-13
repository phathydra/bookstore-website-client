import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGift, FaChevronLeft, FaChevronRight, FaBoxOpen } from "react-icons/fa";

// Import Config
import axiosClient, { ORDER_API_URL } from "../../api/axiosClient";

const ComboPage = () => {
  const navigate = useNavigate();
  
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const PAGE_SIZE = 12;

  useEffect(() => {
    fetchCombos();
    window.scrollTo(0, 0);
  }, [page]);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách Combo
      // Lưu ý: Dùng axiosClient và ghi đè baseURL sang 8082
      const response = await axiosClient.get('/admin/combos', {
        baseURL: ORDER_API_URL, 
        params: { page: page, size: PAGE_SIZE }
      });

      const data = response.data;
      if (data && data.content) {
        setCombos(data.content);
        setTotalPages(data.totalPages);
      } else if (Array.isArray(data)) {
        setCombos(data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Lỗi chính:", error);
      
      // FALLBACK: Nếu API chính lỗi (403/404), thử gọi API /active
      // Đường dẫn: /api/admin/combos/active
      try {
          console.log("Thử gọi API active...");
          const resActive = await axiosClient.get('/admin/combos/active', {
             baseURL: ORDER_API_URL 
          });
          if (Array.isArray(resActive.data)) {
             setCombos(resActive.data);
             setTotalPages(1);
          }
      } catch (e) {
          console.error("API active cũng lỗi:", e);
          setCombos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- UI Pagination ---
  const Pagination = () => {
      if (totalPages <= 1) return null;
      return (
          <div className="flex justify-center items-center gap-4 mt-12">
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
              <span className="text-[#2A5D76] font-semibold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
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
      
      {/* --- HEADER BANNER --- */}
      <div className="relative bg-[#2A5D76] text-white py-16 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute left-10 bottom-10 w-32 h-32 bg-[#4A89A8] rounded-full blur-2xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <div className="bg-white/10 p-4 rounded-full mb-4 backdrop-blur-sm shadow-inner ring-1 ring-white/20">
                <FaGift className="text-[#FFD700] text-4xl animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-4 drop-shadow-md">
                Combo Siêu Tiết Kiệm
            </h1>
            <p className="text-lg text-white/90 max-w-2xl font-light leading-relaxed">
                Mua trọn bộ sách yêu thích với mức giá ưu đãi nhất. Tiết kiệm hơn, đọc nhiều hơn!
            </p>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        
        {/* Info Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 border border-gray-100 flex justify-between items-center">
             <div className="flex items-center gap-2 text-[#2A5D76] font-bold text-lg">
                <FaBoxOpen />
                <span>Danh sách Combo</span>
             </div>
             <div className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full">
                Hiển thị {combos.length} gói ưu đãi
             </div>
        </div>

        {/* Loading & Data */}
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                 <div className="w-12 h-12 border-4 border-[#2A5D76] border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-500 animate-pulse">Đang tìm kiếm combo tốt nhất...</p>
             </div>
        ) : combos.length > 0 ? (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {combos.map((combo) => (
                        <div 
                            key={combo.comboId || combo.id} 
                            onClick={() => navigate(`/combo/${combo.comboId || combo.id}`)} 
                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                        >
                            {/* Hình ảnh */}
                            <div className="h-52 bg-[#F0F4F8] relative overflow-hidden flex items-center justify-center group-hover:bg-[#EBF5F8] transition-colors">
                                {combo.image ? (
                                    <img 
                                        src={combo.image} 
                                        alt={combo.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <FaGift className="text-5xl text-[#2A5D76]/20 mb-3 mx-auto"/>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Combo Book</span>
                                    </div>
                                )}
                                
                                {/* Badge */}
                                <div className="absolute top-0 right-0 bg-[#E67E22] text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl shadow-md z-10">
                                    {combo.discountType === "PERCENT" ? `Giảm ${combo.discountValue}%` : 'Giá sốc'}
                                </div>
                            </div>

                            {/* Nội dung */}
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="font-bold text-[#2A5D76] text-lg mb-2 line-clamp-2 group-hover:text-[#E67E22] transition-colors min-h-[3.5rem]">
                                    {combo.name}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
                                    {combo.description || "Combo sách chọn lọc với mức giá cực kỳ ưu đãi dành cho bạn."}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                        Chi tiết
                                    </span>
                                    <button className="w-8 h-8 rounded-full bg-[#2A5D76] text-white flex items-center justify-center group-hover:bg-[#E67E22] group-hover:scale-110 transition-all shadow-md">
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <Pagination />
            </>
        ) : (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-100 flex flex-col items-center">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <FaBoxOpen className="text-5xl text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">Chưa có combo nào</h3>
                <p className="text-gray-400">Vui lòng quay lại sau để xem các ưu đãi mới nhất.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ComboPage;