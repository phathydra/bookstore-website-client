import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mainCategories } from "../../constant";

const SideNav = () => {
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const navigate = useNavigate();

    return (
        <div className="w-64 bg-cyan-800 text-white h-screen relative z-50">
            <h2 className="font-bold p-4 border-b border-gray-300 bg-cyan-700 text-white !text-xl">
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
                            className="w-full text-left px-1 py-3 hover:bg-cyan-600 transition-colors"
                            onClick={() => navigate(`/products?categoryName=${encodeURIComponent(mainCategory)}`)}
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
