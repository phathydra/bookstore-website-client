// src/products/hooks/useBookFilter.js

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchBooks, fetchAuthorDetails } from "../services/bookService";

export const useBookFilter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParam = new URLSearchParams(location.search);
  
  const searchInput = searchParam.get("searchParam") || "";
  const publisherParam = searchParam.get("bookPublisher") || "";
  const supplierParam = searchParam.get("bookSupplier") || "";
  const authorrParam = searchParam.get("bookAuthor") || "";

  const [books, setBooks] = useState({ content: [], totalPages: 0, number: 0, first: true, last: true });
  const [authorDetails, setAuthorDetails] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [pagesArr, setPagesArr] = useState([]);
  
  const [filters, setFilters] = useState({
    categories: [],
    subCategories: [],
    publishers: publisherParam ? [publisherParam] : [],
    suppliers: supplierParam ? [supplierParam] : [],
    author: authorrParam,
    priceRange: [0, 200000],
  });

  const clearSearchParams = (newAuthor) => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.delete("searchParam");
    currentParams.delete("bookPublisher");
    currentParams.delete("bookSupplier");
    currentParams.set("bookAuthor", newAuthor || "");
    navigate(`${location.pathname}?${currentParams.toString()}`);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const bookFilterInput = {
          mainCategory: filters.categories,
          bookCategory: filters.subCategories.filter(Boolean), 
          bookPublisher: filters.publishers,
          bookSupplier: filters.suppliers,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          input: searchInput,
          bookAuthor: filters.author,
        };
        
        const paginationParams = { page, size };

        const booksData = await fetchBooks(bookFilterInput, paginationParams);
        
        setBooks(booksData);

        setPagesArr(
          booksData.totalPages === 0
            ? []
            : page === 0
              ? booksData.totalPages === 1
                ? [0]
                : [0, 1]
              : page === booksData.totalPages - 1
                ? [page - 1, page]
                : [page - 1, page, page + 1]
        );

        if (filters.author) {
          const authorData = await fetchAuthorDetails(filters.author);
          setAuthorDetails(authorData);
        } else {
          setAuthorDetails(null);
        }
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu:", e);
        setBooks({ content: [], totalPages: 0, number: 0, first: true, last: true });
        setAuthorDetails(null);
      }
    };
    loadData();
  }, [page, size, searchInput, filters]);

  const toggleSelection = (key, value) => {
    setFilters(prev => {
      const isSelected = prev[key].includes(value);
      const newValues = isSelected ? prev[key].filter(v => v !== value) : [...prev[key], value];
      return { ...prev, [key]: newValues };
    });
    setPage(0);
    clearSearchParams();
  };

  const handlePriceRangeChange = (values) => {
    setFilters(prev => ({ ...prev, priceRange: values }));
    setPage(0);
    clearSearchParams();
  };

  const handleAuthorFilterChange = (e) => {
    setFilters(prev => ({ ...prev, author: e.target.value }));
    setPage(0);
    clearSearchParams(e.target.value);
  };
  
  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0);
  };

  return {
    books,
    authorDetails,
    page,
    setPage,
    size,
    handleSizeChange,
    pagesArr,
    filters,
    setFilters, // Thêm setFilters để truyền xuống các component con
    handleAuthorFilterChange,
    toggleSelection,
    handlePriceRangeChange,
  };
};