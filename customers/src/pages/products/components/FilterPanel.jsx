// src/products/components/FilterPanel.js

import React from "react";
import { Range } from "react-range";
import CategoryFilter from "./CategoryFilter"; 

const FilterPanel = ({ filters, toggleSelection, handleAuthorFilterChange, handlePriceRangeChange, setFilters }) => {
  const renderCheckboxFilter = (title, items, selected, key) => (
    <div className="mb-4 text-left">
      <h3 className="font-semibold !text-xl mb-2">{title}</h3>
      <div className="flex flex-col !space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => toggleSelection(key, item)}
              className="cursor-pointer mt-1 !mr-2"
            />
            <span className="leading-6">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="!p-5 bg-gray-100 !border-r !border-gray-300">
      <h2 style={{ color: "red" }} className="!text-3xl mb-3">LỌC THEO</h2>
      <div className="border-b border-gray-300 pb-3 mb-4"></div>
      
      {/* Tác giả */}
      <div className="mb-4 text-left">
        <h3 className="font-semibold !text-xl mb-2">TÁC GIẢ</h3>
        <input
          type="text"
          value={filters.author}
          onChange={handleAuthorFilterChange}
          placeholder="Nhập tên tác giả"
          className="border p-2 w-full"
        />
      </div>

      {/* Danh mục được thay thế bằng component riêng */}
      <CategoryFilter filters={filters} setFilters={setFilters} />

      {/* Giá */}
      <div className="mb-4 text-left">
        <h3 className="font-semibold !text-xl mb-2">GIÁ</h3>
        <div className="mt-2">
          <Range
            step={1000}
            min={0}
            max={1000000}
            values={filters.priceRange}
            onChange={handlePriceRangeChange}
            renderTrack={({ props, children }) => (
              <div {...props} style={{ ...props.style, height: "6px", width: "100%", backgroundColor: "#ccc" }}>
                {children}
              </div>
            )}
            renderThumb={({ props, key }) => (
              <div
                key={key}
                {...props}
                style={{
                  ...props.style,
                  height: "20px",
                  width: "20px",
                  backgroundColor: "#999",
                  borderRadius: "50%",
                }}
              />
            )}
          />
          <div className="text-center text-sm mt-2">
            {filters.priceRange[0].toLocaleString()}đ - {filters.priceRange[1].toLocaleString()}đ
          </div>
        </div>
      </div>

      {/* Nhà xuất bản */}
      {renderCheckboxFilter(
        "NHÀ XUẤT BẢN",
        ["NXB Trẻ", "NXB Kim Đồng", "NXB Giáo dục Việt Nam", "NXB Chính trị quốc gia Sự thật", "NXB Tổng hợp Thành phố Hồ Chí Minh", "NXB Phụ nữ Việt Nam", "NXB Hội Nhà văn", "NXB Lao động", "NXB Dân trí", "NXB Văn học", "NXB Khoa học xã hội", "NXB Đại học Quốc gia Hà Nội", "NXB Thế Giới"],
        filters.publishers,
        "publishers"
      )}

      {/* Nhà cung cấp */}
      {renderCheckboxFilter(
        "NHÀ CUNG CẤP",
        ["Nhã Nam", "Alpha Books", "Megabooks", "Kim Đồng", "Kinokuniya Book Stores", "NXB Trẻ", "Đinh Tị", "AZ Việt Nam", "Tân Việt"],
        filters.suppliers,
        "suppliers"
      )}
    </div>
  );
};

export default FilterPanel;