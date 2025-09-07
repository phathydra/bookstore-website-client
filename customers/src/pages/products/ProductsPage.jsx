// src/products/ProductsPage.js
"use client";

import React from "react";
import { useBookFilter } from "./hooks/useBookFilter";
import FilterPanel from "./components/FilterPanel";
import AuthorInfo from "./components/AuthorInfo";
import BookList from "./components/BookList";

const ProductsPage = () => {
  const {
    books,
    authorDetails,
    page,
    setPage,
    size,
    handleSizeChange,
    pagesArr,
    filters,
    setFilters, // ✅ thêm setFilters từ hook
    handleAuthorFilterChange,
    toggleSelection,
    handlePriceRangeChange,
  } = useBookFilter();

  return (
    <div className="grid grid-cols-[20%_1fr] w-full !p-4 bg-white">
      <FilterPanel
        filters={filters}
        setFilters={setFilters} // ✅ truyền xuống FilterPanel
        toggleSelection={toggleSelection}
        handleAuthorFilterChange={handleAuthorFilterChange}
        handlePriceRangeChange={handlePriceRangeChange}
      />
      <div className="p-5 w-full bg-green-50">
        {filters.author && <AuthorInfo authorDetails={authorDetails} />}
        <BookList
          books={books}
          size={size}
          handleSizeChange={handleSizeChange}
          pagesArr={pagesArr}
          page={page}
          setPage={setPage}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
