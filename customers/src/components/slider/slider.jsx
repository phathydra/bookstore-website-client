import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Slider() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // State cho slider chạy
  const navigate = useNavigate();

  // --- 1. LẤY DỮ LIỆU ---
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/banners/active");
        setBanners(response.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy banner:", error);
      }
    };
    fetchBanners();
  }, []);

  // --- PHÂN LOẠI BANNER ---
  const mainSliders = banners.filter((b) => b.position === "MAIN_SLIDER");
  const rightTop = banners.find((b) => b.position === "RIGHT_TOP");
  const rightBottom = banners.find((b) => b.position === "RIGHT_BOTTOM");

  // --- 2. LOGIC AUTO-SLIDE (Thay thế Carousel của Bootstrap) ---
  useEffect(() => {
    if (mainSliders.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === mainSliders.length - 1 ? 0 : prevIndex + 1));
    }, 3000); // 3 giây đổi ảnh

    return () => clearInterval(interval);
  }, [mainSliders.length]);

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mainSliders.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === mainSliders.length - 1 ? 0 : prev + 1));
  };

  // --- 3. HÀM XỬ LÝ CLICK ---
  const handleBannerClick = (banner) => {
    if (!banner) return;
    navigate(banner.linkUrl || "/banner", {
      state: {
        bannerImage: banner.imageUrl,
        bannerTitle: banner.title,
      },
    });
  };

  return (
    // slider-wrapper -> w-full mb-5
    <div className="w-full mb-5 px-2 md:px-0"> 
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        
        {/* --- CỘT TRÁI: SLIDER (Chiếm 8/12 cột) --- */}
        <div className="col-span-1 lg:col-span-8 relative group h-[320px] rounded-lg overflow-hidden shadow-sm">
            {mainSliders.length > 0 ? (
                <>
                    {/* Ảnh Slider */}
                    <div 
                        className="w-full h-full bg-center bg-cover duration-500 ease-in-out cursor-pointer"
                        style={{ backgroundImage: `url(${mainSliders[currentIndex].imageUrl})` }}
                        onClick={() => handleBannerClick(mainSliders[currentIndex])}
                    ></div>

                    {/* Nút Previous (Hiện khi hover vào slider) */}
                    <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition-all" onClick={prevSlide}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </div>

                    {/* Nút Next */}
                    <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition-all" onClick={nextSlide}>
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>

                    {/* Indicators (Dấu chấm tròn bên dưới) */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {mainSliders.map((_, index) => (
                            <div
                                key={index}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                                    currentIndex === index ? "bg-white scale-110" : "bg-white/50"
                                }`}
                            ></div>
                        ))}
                    </div>
                </>
            ) : (
                // Fallback nếu không có ảnh
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No Banner
                </div>
            )}
        </div>

        {/* --- CỘT PHẢI: 2 BANNER TĨNH (Chiếm 4/12 cột) --- */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-2 h-[320px]">
          
          {/* Ảnh Trên */}
          <div className="flex-1 rounded-lg overflow-hidden relative shadow-sm h-[155px]">
            <img
              src={rightTop?.imageUrl || "https://via.placeholder.com/400x155?text=Right+Top"}
              alt={rightTop?.title || "Banner Top"}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => handleBannerClick(rightTop)}
            />
          </div>

          {/* Ảnh Dưới */}
          <div className="flex-1 rounded-lg overflow-hidden relative shadow-sm h-[155px]">
            <img
              src={rightBottom?.imageUrl || "https://via.placeholder.com/400x155?text=Right+Bottom"}
              alt={rightBottom?.title || "Banner Bottom"}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => handleBannerClick(rightBottom)}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default Slider;