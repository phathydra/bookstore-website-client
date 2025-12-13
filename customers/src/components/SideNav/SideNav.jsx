import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mainCategories } from "../../constant"; 

const SideNav = () => {
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const navigate = useNavigate();

    return (
        // Container chính: Bỏ h-screen, thêm bg-white, shadow, z-index cao để đè lên Slider
        <div className="w-64 bg-white text-gray-800 shadow-xl border border-gray-200 rounded-b-md relative z-50">
            <ul>
                {Object.keys(mainCategories).map((mainCategory, index) => (
                    <li 
                        key={index} 
                        className="relative group border-b border-gray-100 last:border-none"
                        onMouseEnter={() => setHoveredCategory(mainCategory)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        {/* Mục danh mục chính */}
                        <button
                            className="w-full text-left px-4 py-3 hover:bg-cyan-50 hover:text-cyan-700 transition-colors flex justify-between items-center"
                            onClick={() => navigate(`/products?categoryName=${encodeURIComponent(mainCategory)}`)}
                        >
                            <span className="font-medium text-sm">{mainCategory}</span>
                            {/* Mũi tên nhỏ chỉ sang phải nếu có danh mục con */}
                            {mainCategories[mainCategory] && mainCategories[mainCategory].length > 0 && (
                                <span className="text-gray-400 text-xs">›</span>
                            )}
                        </button>

                        {/* Danh mục con (Sub-menu) hiển thị sang bên phải */}
                        {hoveredCategory === mainCategory && mainCategories[mainCategory] && mainCategories[mainCategory].length > 0 && (
                            <ul className="absolute left-full top-0 w-64 bg-white shadow-xl border border-gray-200 rounded-md min-h-full z-50">
                                {mainCategories[mainCategory].map((subCategory, subIndex) => (
                                    <li
                                        key={subIndex}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-cyan-700 hover:bg-cyan-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/products?categoryName=${encodeURIComponent(subCategory)}`)}
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