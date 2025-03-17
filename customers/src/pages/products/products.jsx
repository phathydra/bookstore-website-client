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
  const location = useLocation();
  const searchParam = new URLSearchParams(location.search);
  const searchInput = searchParam.get("searchParam");

  useEffect(() => {
    fetchBooks();
  }, [page, size, searchInput]);

  const fetchBooks = async () => {
    try {
      const response = searchInput
        ? await axios.post(
            "http://localhost:8081/api/book/search",
            {},
            { params: { page, size, input: searchInput } }
          )
        : await axios.get("http://localhost:8081/api/book", { params: { page, size } });
      
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

  return (
    <div className="grid grid-cols-[20%_1fr] w-full m-4 bg-white">
      <div className="p-5 bg-gray-100 border-r border-gray-300">
        <Categories />
      </div>
      <div className="p-5 w-full bg-green-50">
        {/* Dropdown chọn số item được di chuyển lên đầu trang và căn phải */}
        <div className="flex justify-end items-center mb-4">
          <label htmlFor="size-select" className="mr-2">
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

        <div className="grid grid-cols-4 gap-5">
          {(books?.content || []).map((book, index) => (
            <Book book={book} key={index} />
          ))}
        </div>

        <div className="mt-5" style={books.totalPages === 0 ? { display: "none" } : {}}>
          <div className="text-center mb-2 text-gray-700">
            Trang {books.number + 1} / {books.totalPages}
          </div>
          <div className="flex justify-center items-center space-x-2">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 transition duration-200"
              disabled={books.first}
              onClick={() => setPage(page - 1)}
            >
              {"<"}
            </button>
            {pagesArr.map((number, index) => (
              <button
                key={index}
                className={`py-2 px-4 rounded transition duration-200 ${
                  number === books.number
                    ? "bg-gray-300 text-black cursor-default"
                    : "bg-blue-500 text-white hover:bg-blue-700"
                }`}
                onClick={() => setPage(number)}
                disabled={number === books.number}
              >
                {number + 1}
              </button>
            ))}
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 transition duration-200"
              disabled={books.last}
              onClick={() => setPage(page + 1)}
            >
              {">"}
            </button>
          </div>
          <div className="flex justify-center items-center mt-4 space-x-2">
            <input
              type="number"
              min={1}
              max={books.totalPages}
              placeholder="Type..."
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              className="p-2 border rounded w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                let pageNum = Number(jumpPage);
                if(pageNum < 1) pageNum = 1;
                if(pageNum > books.totalPages) pageNum = books.totalPages;
                setPage(pageNum - 1);
                setJumpPage("");
              }}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
            >
              Go to
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
