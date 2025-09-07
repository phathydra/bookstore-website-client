// src/products/components/CategoryFilter.js
import React, { useState } from "react";

export const mainCategories = {
  "Văn Học": ["Tiểu thuyết", "Truyện ngắn", "Thơ ca", "Kịch", "Ngụ ngôn"],
  "Giáo Dục & Học Thuật": ["Sách giáo khoa", "Sách tham khảo", "Ngoại ngữ", "Sách khoa học"],
  "Kinh Doanh & Phát Triển Bản Thân": ["Quản trị", "Tài chính", "Khởi nghiệp", "Lãnh đạo", "Kỹ năng sống"],
  "Khoa Học & Công Nghệ": ["Vật lý", "Hóa học", "Sinh học", "Công nghệ", "Lập trình"],
  "Lịch Sử & Địa Lý": ["Lịch sử thế giới", "Lịch sử Việt Nam", "Địa lý"],
  "Tôn Giáo & Triết Học": ["Phật giáo", "Thiên Chúa giáo", "Hồi giáo", "Triết học"],
  "Sách Thiếu Nhi": ["Truyện cổ tích", "Truyện tranh", "Sách giáo dục trẻ em"],
  "Văn Hóa & Xã Hội": ["Du lịch", "Nghệ thuật", "Tâm lý - xã hội"],
  "Sức Khỏe & Ẩm Thực": ["Nấu ăn", "Dinh dưỡng", "Thể dục - thể thao"],
};

const CategoryFilter = ({ filters, setFilters }) => {
  const [openCategories, setOpenCategories] = useState([]);

  const handleMainCategoryChange = (category) => {
    const isChecked = filters.categories.includes(category);
    const newSelectedCategories = isChecked
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    let newSelectedSubCategories = [...filters.subCategories];

    if (isChecked) {
      // Bỏ chọn danh mục chính và các danh mục phụ của nó
      newSelectedSubCategories = newSelectedSubCategories.filter(
        (sub) => !mainCategories[category].includes(sub)
      );
      setOpenCategories(openCategories.filter((c) => c !== category));
    } else {
      // Mở danh mục phụ khi danh mục chính được chọn
      setOpenCategories([...openCategories, category]);
    }

    // Cập nhật state trực tiếp và đảm bảo giá trị là mảng phẳng
    setFilters(prev => ({
      ...prev,
      categories: newSelectedCategories,
      subCategories: newSelectedSubCategories
    }));
  };

  const handleSubCategoryChange = (subCategory) => {
    const isChecked = filters.subCategories.includes(subCategory);
    const newSelectedSubCategories = isChecked
      ? filters.subCategories.filter((sub) => sub !== subCategory)
      : [...filters.subCategories, subCategory];

    // Cập nhật state trực tiếp và đảm bảo giá trị là mảng phẳng
    setFilters(prev => ({
      ...prev,
      subCategories: newSelectedSubCategories
    }));
  };

  return (
    <div className="mb-4 text-left">
      <h3 className="font-semibold !text-xl mb-2">DANH MỤC</h3>
      <div className="flex flex-col !space-y-2">
        {Object.keys(mainCategories).map((category) => (
          <div key={category} className="flex flex-col">
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleMainCategoryChange(category)}
                className="cursor-pointer mt-1 !mr-2"
              />
              <span className="leading-6">{category}</span>
            </div>
            {openCategories.includes(category) && (
              <div className="ml-6 mt-2 flex flex-col space-y-1">
                {mainCategories[category].map((subCategory) => (
                  <div key={subCategory} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={filters.subCategories.includes(subCategory)}
                      onChange={() => handleSubCategoryChange(subCategory)}
                      className="cursor-pointer mt-1 !mr-2"
                    />
                    <span className="leading-6">{subCategory}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;