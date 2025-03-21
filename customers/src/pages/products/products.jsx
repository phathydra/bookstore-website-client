import React, { useState, useEffect } from "react";
import Categories from "../../components/categories/categories";
import Book from "../../components/book/book";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Products = () => {
  const [books, setBooks] = useState({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [pagesArr, setPagesArr] = useState([]);
  const [jumpPage, setJumpPage] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const location = useLocation();
  const searchParam = new URLSearchParams(location.search);
  const searchInput = searchParam.get("searchParam");

  useEffect(() => {
    fetchBooks();
  }, [page, size, searchInput, selectedCategories, selectedPublishers, priceRange]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/book", {
        params: {
          page,
          size,
          categories: selectedCategories.join(","),
          publishers: selectedPublishers.join(","),
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          input: searchInput,
        },
      });

      setBooks(response.data);
      if (page === 0) {
        setPagesArr(response.data.totalPages === 1 ? [0] : [0, 1]);
      } else if (page === response.data.totalPages - 1) {
        setPagesArr([page - 1, page]);
      } else {
        setPagesArr([page - 1, page, page + 1]);
      }
    } catch (e) {
      console.error("Error fetching books:", e);
    }
  };

  const toggleSelection = (value, setState, state) => {
    setState(state.includes(value) ? state.filter((v) => v !== value) : [...state, value]);
  };

  return (
    <div className="grid grid-cols-[20%_1fr] w-full p-4 bg-white">
      {/* Sidebar Categories */}
      <div className="p-5 bg-gray-100 border-r border-gray-300">
        <h2 style={{ color: "red" }} className="text-xl mb-3">BỘ LỌC</h2>
        <div className="border-b border-gray-300 pb-3 mb-4"></div>

        {/* Thể loại */}
        <div className="mb-4 text-left">
          <h3 className="font-semibold mb-2 !text-xl">THỂ LOẠI</h3>
          {["Văn Học", "Giáo dục và học thuật"].map((category) => (
            <label key={category} className="flex items-start gap-2 mb-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleSelection(category, setSelectedCategories, selectedCategories)}
                className="cursor-pointer"
              />
              <span className="leading-6">{category}</span>
            </label>
          ))}
        </div>

        {/* Giá */}
        <div className="mb-4 text-left">
          <h3 className="font-semibold !text-xl mb-2">GIÁ</h3>
          {[
            [0, 50000],
            [50000, 150000],
            [150000, 300000],
          ].map(([min, max]) => (
            <label key={min} className="flex items-start gap-2 mb-2 text-sm">
              <input
                type="checkbox"
                checked={priceRange[0] === min && priceRange[1] === max}
                onChange={() => setPriceRange([min, max])}
                className="cursor-pointer mt-1"
              />
              <span className="leading-6">
                {min.toLocaleString()}đ - {max.toLocaleString()}đ
              </span>
            </label>
          ))}
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max="500000"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="500000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full"
            />
            <div className="text-center text-sm">
              {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
            </div>
          </div>
        </div>


        {/* Nhà xuất bản */}
        <div className="mb-4 text-left">
          <h3 className="font-semibold !text-xl mb-2">NHÀ XUẤT BẢN</h3>
          {["Nhà xuất bản Kim Đồng", "Nhà xuất bản Dân Trí"].map((publisher) => (
            <label key={publisher} className="flex items-start gap-2 mb-2 text-sm">
              <input
                type="checkbox"
                checked={selectedPublishers.includes(publisher)}
                onChange={() => toggleSelection(publisher, setSelectedPublishers, selectedPublishers)}
                className="cursor-pointer mt-1"
              />
              <span className="leading-6">{publisher}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 w-full bg-green-50">
        {/* Dropdown số lượng sản phẩm mỗi trang */}
        <div className="flex justify-end items-center mb-4">
          <label htmlFor="size-select" className="mr-2 text-gray-700">
            Số lượng mỗi trang:
          </label>
          <select
            id="size-select"
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[12, 24, 60, 120].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Hiển thị danh sách sách */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {(books?.content || []).map((book, index) => (
            <Book book={book} key={index} />
          ))}
        </div>

        {/* Pagination */}
        {books.totalPages > 0 && (
          <div className="mt-5">
            <div className="text-center mb-2 text-gray-700">
              Trang {books.number + 1} / {books.totalPages}
            </div>

            <div className="flex justify-center items-center space-x-2">
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
                disabled={books.first}
                onClick={() => setPage(page - 1)}
              >
                {"<"}
              </button>

              {pagesArr.map((number) => (
                <button
                  key={number}
                  className={`py-2 px-4 rounded ${
                    number === books.number ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-700"
                  }`}
                  onClick={() => setPage(number)}
                  disabled={number === books.number}
                >
                  {number + 1}
                </button>
              ))}

              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
                disabled={books.last}
                onClick={() => setPage(page + 1)}
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
