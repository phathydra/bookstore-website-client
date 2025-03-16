import React, { useState } from "react";

const Categories = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Mảng các thể loại, gồm value và label
  const categoryOptions = [
    { value: "trinh-tham", label: "Trinh thám" },
    { value: "kinh-di", label: "Kinh dị" },
    { value: "khoa-hoc", label: "Khoa học" },
    { value: "other", label: "..." },
  ];

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((cat) => cat !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="text-left">
      <p className="text-2xl font-bold mb-2">Bộ lọc</p>
      <div className="mb-5 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <p className="text-[1.2rem] font-bold mb-2">Giá</p>
        <div className="space-y-2">
          <label className="flex items-center text-base cursor-pointer">
            <input
              type="radio"
              name="price"
              value="1-100000"
              className="mr-2 cursor-pointer accent-teal-500"
            />
            1 - 100,000 VND
          </label>
          <label className="flex items-center text-base cursor-pointer">
            <input
              type="radio"
              name="price"
              value="100000-1000000"
              className="mr-2 cursor-pointer accent-teal-500"
            />
            100,000 - 1,000,000 VND
          </label>
          <label className="flex items-center text-base cursor-pointer">
            <input
              type="radio"
              name="price"
              value="other"
              className="mr-2 cursor-pointer accent-teal-500"
            />
            ? - ? VND
          </label>
        </div>
      </div>
      <div className="mb-5 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <p className="text-[1.2rem] font-bold mb-2">Thể loại</p>
        <div className="space-y-2">
          {categoryOptions.map((category, index) => (
            <label
              key={index}
              className="flex items-center text-base cursor-pointer"
            >
              <input
                type="checkbox"
                value={category.value}
                onChange={handleCategoryChange}
                className="mr-2 cursor-pointer accent-teal-500"
                checked={selectedCategories.includes(category.value)}
              />
              {category.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
