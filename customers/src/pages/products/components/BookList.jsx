// src/products/components/BookList.js
import React from "react";
import Book from "../../../components/book/book";

const BookList = ({ books, size, handleSizeChange, pagesArr, page, setPage }) => {
  return (
    <div className="p-5 w-full bg-green-50">
      <div className="flex justify-end items-center mb-4">
        <label htmlFor="size-select" className="mr-2 text-gray-700">
          Số lượng mỗi trang:
        </label>
        <select
          id="size-select"
          value={size}
          onChange={handleSizeChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[12, 24, 60, 120].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {(books?.content || []).map((book, index) => (
          <Book book={book} key={index} />
        ))}
      </div>
      {books.totalPages > 0 && (
        <div className="mt-5">
          <div className="text-center mb-2 text-gray-7000">
            Trang {books.number + 1} / {books.totalPages}
          </div>
          <div className="flex justify-center items-center space-x-2">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
              disabled={books.first}
              onClick={() => setPage(page - 1)}
            >{"<"}</button>
            {pagesArr.map((number) => (
              <button
                key={number}
                className={`py-2 px-4 rounded ${number === books.number ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-700"}`}
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
            >{">"}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;