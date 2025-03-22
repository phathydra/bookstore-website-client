import React, { useState, useEffect } from "react";
import Categories from "../../components/categories/categories";
import Book from "../../components/book/book";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Range } from 'react-range'; // Import react-range

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
  const [authorFilter, setAuthorFilter] = useState("");

  useEffect(() => {
    fetchBooks();
  }, [page, size, searchInput, selectedCategories, selectedPublishers, priceRange, authorFilter]);

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
          author: authorFilter,
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
    <div className="grid grid-cols-[20%_1fr] w-full !p-4 bg-white">
      {/* Sidebar Categories */}
      <div className="!p-5 bg-gray-100 !border-r !border-gray-300">
        <h2 style={{ color: "red" }} className="!text-3xl mb-3">LỌC THEO</h2>
        <div className="border-b border-gray-300 pb-3 mb-4"></div>
        {/* Lọc theo tác giả */}
        <div className="mb-4 text-left">
          <h3 className="font-semibold !text-xl mb-2">TÁC GIẢ</h3>
          <input
            type="text"
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            placeholder="Nhập tên tác giả"
            className="border p-2 w-full"
          />
        </div>
        {/* Thể loại */}
        <div className="mb-4 text-left">
          <h3 className="font-semibold mb-2 !text-xl ">DANH MỤC CHÍNH</h3>
          <div className="flex !flex-col ">
            {["Văn Học", "Giáo Dục & Học Thuật", "Kinh Doanh & Phát Triển Bản Thân",
              "Khoa Học & Công Nghệ", "Lịch Sử & Địa Lý", "Tôn Giáo & Triết Học", "Sách Thiếu Nhi", "Văn Hóa & Xã Hội", "Sức Khỏe & Ẩm Thực"].map((category) => (
                <div key={category} className="flex items-start mb-1">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleSelection(category, setSelectedCategories, selectedCategories)}
                    className="cursor-pointer mt-1 !mr-2"
                  />
                  <span className="leading-6">{category}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Giá */}
        <div className="mb-4 text-left">
          <h3 className="font-semibold !text-xl mb-2">GIÁ</h3>
          <div className="flex flex-col space-y-2">
            {[
              [0, 150000],
              [150000, 300000],
              [300000, 500000],
              [500000, 700000],
              [700000, 1000000],
            ].map(([min, max]) => (
              <div key={`<span class="math-inline">\{min\}\-</span>{max}`} className="flex items-start">
                <input
                  type="checkbox"
                  checked={priceRange[0] === min && priceRange[1] === max}
                  onChange={() => setPriceRange([min, max])}
                  className="cursor-pointer mt-1 !mr-2"
                />
                <span className="leading-6">
                  {min.toLocaleString()}đ - {max.toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4">Hoặc chọn mức giá phù hợp</p>
          <div className="mt-2">
            <Range
              step={1000}
              min={0}
              max={1000000}
              values={priceRange}
              onChange={(values) => setPriceRange(values)}
              renderTrack={({ props, children }) => (
                <div
                  {...(props && { ...props })}
                  style={{
                    ...props.style,
                    height: '6px',
                    width: '100%',
                    backgroundColor: '#ccc',
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props, isDragged }) => (
                <div
                  {...(props && { ...props })}
                  style={{
                    ...props.style,
                    height: '20px',
                    width: '20px',
                    backgroundColor: '#999',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      height: '10px',
                      width: '10px',
                      backgroundColor: '#fff',
                      borderRadius: '50%',
                    }}
                  />
                </div>
              )}
            />
            <div className="text-center text-sm mt-2">
              {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
            </div>
          </div>
        </div>

        {/* Nhà xuất bản */}
        <div className="mb-4 text-left">
          <h3 className="font-semibold !text-xl mb-2">NHÀ XUẤT BẢN</h3>
          <div className="flex flex-col !space-y-2">
            {["NXB Trẻ", "NXB Kim Đồng", "NXB Giáo dục Việt Nam", "NXB Chính trị quốc gia Sự thật", "NXB Tổng hợp Thành phố Hồ Chí Minh",
              "NXB Phụ nữ Việt Nam", "NXB Hội Nhà văn", "NXB Lao động", "NXB Dân trí", "NXB Văn học", "NXB Khoa học xã hội", "NXB Đại học Quốc gia Hà Nội"].map((publisher) => (
                <div key={publisher} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedPublishers.includes(publisher)}
                    onChange={() => toggleSelection(publisher, setSelectedPublishers, selectedPublishers)}
                    className="cursor-pointer mt-1 !mr-2"
                  />
                  <span className="leading-6">{publisher}</span>
                </div>
              ))}
          </div>
        </div>
        {/* Nhà xuất bản */}
        <div className="mb-4 text-left">
          <h3 className="font-semibold !text-xl mb-2">NHÀ CUNG CẤP</h3>
          <div className="flex flex-col !space-y-2">
            {["Nhà Nam","Alpha Books","Megabooks","Kim Đồng","Kinokuniya Book Stores","NXB Trẻ","Đinh Tị","AZ Việt Nam","Tân Việt"].map((publisher) => (
                <div key={publisher} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedPublishers.includes(publisher)}
                    onChange={() => toggleSelection(publisher, setSelectedPublishers, selectedPublishers)}
                    className="cursor-pointer mt-1 !mr-2"
                  />
                  <span className="leading-6">{publisher}</span>
                </div>
              ))}
          </div>
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
                  className={`py-2 px-4 rounded ${number === books.number ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-700"
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