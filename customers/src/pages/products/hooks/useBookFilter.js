// src/products/hooks/useBookFilter.js

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// (THÊM 1) Import thêm 'trackFilter'
import { fetchBooks, fetchAuthorDetails, trackFilter } from "../services/bookService"; 
// (THÊM 2) Import 'useDebounce'. (Giả sử đường dẫn này là đúng theo cấu trúc thư mục của bạn)
import { useDebounce } from "../../../components/header/hooks/useDebounce";

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

  // (THÊM 3) Dùng Debounce cho object 'filters'
  // API sẽ chỉ được gọi 500ms SAU KHI người dùng ngừng nhấp/kéo.
  const debouncedFilters = useDebounce(filters, 500);

  const clearSearchParams = (newAuthor) => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.delete("searchParam");
    currentParams.delete("bookPublisher");
    currentParams.delete("bookSupplier");
    currentParams.set("bookAuthor", newAuthor || "");
    navigate(`${location.pathname}?${currentParams.toString()}`);
  };

  // (SỬA 4) Toàn bộ useEffect này giờ sẽ chạy dựa trên `debouncedFilters`
  useEffect(() => {
    const loadData = async () => {
      try {
        // (SỬA 5) Sử dụng `debouncedFilters` để tạo input
        const bookFilterInput = {
          mainCategory: debouncedFilters.categories,
          bookCategory: debouncedFilters.subCategories.filter(Boolean), 
          bookPublisher: debouncedFilters.publishers,
          bookSupplier: debouncedFilters.suppliers,
          minPrice: debouncedFilters.priceRange[0],
          maxPrice: debouncedFilters.priceRange[1],
          input: searchInput, // Giữ nguyên searchInput từ URL
          bookAuthor: debouncedFilters.author,
        };
        
        const paginationParams = { page, size };

        // 1. GỌI API LẤY SÁCH
        const booksData = await fetchBooks(bookFilterInput, paginationParams);
        
        // (THÊM 6) GỌI API TRACKING (fire-and-forget)
        // Chỉ log nếu người dùng thực sự có lọc gì đó
        const hasMeaningfulFilters = 
            debouncedFilters.categories.length > 0 ||
            debouncedFilters.subCategories.length > 0 ||
            debouncedFilters.publishers.length > 0 ||
            debouncedFilters.suppliers.length > 0 ||
            debouncedFilters.author !== "" ||
            debouncedFilters.priceRange[0] !== 0 ||
            debouncedFilters.priceRange[1] !== 200000;

        if (hasMeaningfulFilters) {
          const accountId = localStorage.getItem("accountId");
          // Gửi đi `bookFilterInput` (là object filter sạch)
          trackFilter(bookFilterInput, accountId).catch(err => {
            console.warn("Lỗi khi tracking filter:", err);
          });
        }
        
        // Cập nhật state Sách
        setBooks(booksData);

        // Cập nhật state Phân trang
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

        // (SỬA 7) Cập nhật thông tin tác giả dựa trên `debouncedFilters`
        if (debouncedFilters.author) {
          const authorData = await fetchAuthorDetails(debouncedFilters.author);
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
    // (SỬA 8) Dependency chính của useEffect giờ là `debouncedFilters`
  }, [page, size, searchInput, debouncedFilters]); 

  // --- CÁC HÀM HANDLER BÊN DƯỚI GIỮ NGUYÊN ---
  // Chúng cập nhật state `filters` (tức thời)
  // `useDebounce` sẽ tự động cập nhật `debouncedFilters` (bị trễ)
  // `useEffect` sẽ tự động chạy sau khi `debouncedFilters` cập nhật

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
    filters, // <-- Vẫn trả về 'filters' (tức thời) để UI (checkbox) phản hồi ngay
    setFilters, 
    handleAuthorFilterChange,
    toggleSelection,
    handlePriceRangeChange,
  };
};