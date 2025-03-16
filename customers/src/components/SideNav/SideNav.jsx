import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const mainCategories = {
    "Văn Học": ["Tiểu thuyết", "Truyện ngắn", "Thơ ca", "Kịch", "Ngụ ngôn"],
    "Giáo Dục & Học Thuật": ["Sách giáo khoa", "Sách tham khảo", "Ngoại ngữ", "Sách khoa học"],
    "Kinh Doanh & Phát Triển Bản Thân": ["Quản trị", "Tài chính", "Khởi nghiệp", "Lãnh đạo", "Kỹ năng sống"],
    "Khoa Học & Công Nghệ": ["Vật lý", "Hóa học", "Sinh học", "Công nghệ", "Lập trình"],
    "Lịch Sử & Địa Lý": ["Lịch sử thế giới", "Lịch sử Việt Nam", "Địa lý"],
    "Tôn Giáo & Triết Học": ["Phật giáo", "Thiên Chúa giáo", "Hồi giáo", "Triết học"],
    "Sách Thiếu Nhi": ["Truyện cổ tích", "Truyện tranh", "Sách giáo dục trẻ em"],
    "Văn Hóa & Xã Hội": ["Du lịch", "Nghệ thuật", "Tâm lý - xã hội"],
    "Sức Khỏe & Ẩm Thực": ["Nấu ăn", "Dinh dưỡng", "Thể dục - thể thao"]
};

const SideNav = () => {
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const navigate = useNavigate();

    return (
        <div className="w-64 bg-cyan-800 text-white h-screen relative z-50 ml-4"> {/* Thêm ml-4 để cách lề */}
            <h2 className="text-xl font-bold p-4 border-b border-gray-300 bg-cyan-700 text-white !text-xl">
                TẤT CẢ DANH MỤC
            </h2>

            <ul>
                {Object.keys(mainCategories).map((mainCategory, index) => (
                    <li 
                        key={index} 
                        className="relative group"
                        onMouseEnter={() => setHoveredCategory(mainCategory)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        {/* Nhấn vào danh mục chính */}
                        <button
                            className="w-full text-left px-4 py-3 hover:bg-cyan-600 transition-colors"
                            onClick={() => navigate(`/category/${encodeURIComponent(mainCategory)}`)}
                        >
                            {mainCategory}
                        </button>

                        {/* Hiển thị danh mục con theo chiều ngang */}
                        {hoveredCategory === mainCategory && mainCategories[mainCategory].length > 0 && (
                            <ul className="absolute left-full top-0 w-64 bg-cyan-700 shadow-lg rounded-md z-50">
                                {mainCategories[mainCategory].map((subCategory, subIndex) => (
                                    <li
                                        key={subIndex}
                                        className="px-4 py-2 text-sm hover:bg-cyan-500 cursor-pointer"
                                        onClick={() => navigate(`/category/${encodeURIComponent(subCategory)}`)}
                                    >
                                        {subCategory}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SideNav;
