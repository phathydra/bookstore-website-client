import React from "react";

const Categories = () => {
  return (
    <>
      <p className="text-2xl font-bold mb-2">Bộ lọc</p>
      <div className="mb-5 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <p className="text-[1.2rem] font-bold mb-2">Giá</p>
        <div className="space-y-2">
          <label className="flex items-center justify-start text-base cursor-pointer">
            <input
              type="radio"
              name="price"
              value="1-100000"
              className="mr-2 cursor-pointer accent-teal-500"
            />
            1 - 100,000 VND
          </label>
          <label className="flex items-center justify-start text-base cursor-pointer">
            <input
              type="radio"
              name="price"
              value="100000-1000000"
              className="mr-2 cursor-pointer accent-teal-500"
            />
            100,000 - 1,000,000 VND
          </label>
          <label className="flex items-center justify-start text-base cursor-pointer">
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
          <label className="flex items-center justify-start text-base cursor-pointer">
            <input
              type="checkbox"
              value="trinh-tham"
              className="mr-2 cursor-pointer accent-teal-500"
            />
            Trinh thám
          </label>
          <label className="flex items-center justify-start text-base cursor-pointer">
            <input
              type="checkbox"
              value="kinh-di"
              className="mr-2 cursor-pointer accent-teal-500"
            />
            Kinh dị
          </label>
          <label className="flex items-center justify-start text-base cursor-pointer">
            <input
              type="checkbox"
              value="khoa-hoc"
              className="mr-2 cursor-pointer accent-teal-500"
            />
            Khoa học
          </label>
          <label className="flex items-center justify-start text-base cursor-pointer">
            <input
              type="checkbox"
              value="other"
              className="mr-2 cursor-pointer accent-teal-500"
            />
            ...
          </label>
        </div>
      </div>
    </>
  );
};

export default Categories;