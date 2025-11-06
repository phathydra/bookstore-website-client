// Thay thế toàn bộ file Home.jsx bằng code này

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "../../components/slider/slider.jsx";
import Book from "../../components/book/book.jsx";
import SideNav from "../../components/SideNav/SideNav.jsx";
import { useBooks } from "./hooks/useBooks.js";
import { useDiscountedBooks } from "./hooks/useDiscountedBooks.js";
import { useTopSellingBooks } from "./hooks/useTopSellingBooks.js";
import { useSuggestedBooks } from "./hooks/useSuggestedBooks.js";
import { useActiveCombos } from "./hooks/useActiveCombos.js";

const Home = () => {
  const [discountedPage, setDiscountedPage] = useState(0);
  
  // ⬇️ THÊM STATE PAGING CHO 2 KHU VỰC MỚI ⬇️
  const [topSellingPage, setTopSellingPage] = useState(0);
  const [suggestedPage, setSuggestedPage] = useState(0);
  // ⬆️ KẾT THÚC THÊM STATE ⬆️

  const [isHovered, setIsHovered] = useState(false);
  const [onHovered, setOnHoverd] = useState(null);
  const navigate = useNavigate();

  const accountId = localStorage.getItem("accountId");

  const { books } = useBooks();
  const { discountedBooks, discountedTotalPages } =
    useDiscountedBooks(discountedPage);
  const { topSellingBooks } = useTopSellingBooks();
  const { suggestedBooks } = useSuggestedBooks(accountId);
  const { activeCombos, loadingCombos } = useActiveCombos();

  // --- LOGIC PAGING ---
  const BOOKS_PER_PAGE = 5; // ⬅️ HIỆN 5 CUỐN MỖI LẦN

  // Logic cho "Giảm giá sốc" (giữ nguyên)
  const handleNextPage = () => {
    if (discountedPage < discountedTotalPages - 1) {
      setDiscountedPage(discountedPage + 1);
    }
  };
  const handlePrevPage = () => {
    if (discountedPage > 0) {
      setDiscountedPage(discountedPage - 1);
    }
  };

  // ⬇️ LOGIC MỚI CHO "BÁN CHẠY NHẤT" ⬇️
  const topSellingTotalPages = Math.ceil(topSellingBooks.length / BOOKS_PER_PAGE);
  const handleNextTopSellingPage = () => {
    if (topSellingPage < topSellingTotalPages - 1) {
      setTopSellingPage(topSellingPage + 1);
    }
  };
  const handlePrevTopSellingPage = () => {
    if (topSellingPage > 0) {
      setTopSellingPage(topSellingPage - 1);
    }
  };
  const currentTopSellingBooks = topSellingBooks.slice(
    topSellingPage * BOOKS_PER_PAGE,
    (topSellingPage + 1) * BOOKS_PER_PAGE
  );
  // ⬆️ KẾT THÚC LOGIC MỚI ⬆️

  // ⬇️ LOGIC MỚI CHO "CÓ THỂ BẠN SẼ THÍCH" ⬇️
  const suggestedTotalPages = Math.ceil(suggestedBooks.length / BOOKS_PER_PAGE);
  const handleNextSuggestedPage = () => {
    if (suggestedPage < suggestedTotalPages - 1) {
      setSuggestedPage(suggestedPage + 1);
    }
  };
  const handlePrevSuggestedPage = () => {
    if (suggestedPage > 0) {
      setSuggestedPage(suggestedPage - 1);
    }
  };
  const currentSuggestedBooks = suggestedBooks.slice(
    suggestedPage * BOOKS_PER_PAGE,
    (suggestedPage + 1) * BOOKS_PER_PAGE
  );
  // ⬆️ KẾT THÚC LOGIC MỚI ⬆️


  // (Hàm renderComboCard giữ nguyên)
  const renderComboCard = (combo) => {
    const booksInCombo = combo.books || [];

    let discountText = "";
    if (combo.discountType === "PERCENT") {
      discountText = `Giảm ${combo.discountValue}%`;
    } else {
      discountText = `Giảm ${Math.round(combo.discountValue / 1000)}K`;
    }

    return (
      <div
        key={combo.comboId}
        className="relative flex-shrink-0 w-64 h-80 rounded-lg shadow-lg bg-white
                   flex flex-col cursor-pointer overflow-hidden 
                   group transition-all duration-300 
                   hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
        onClick={() => navigate(`/combo/${combo.comboId}`)}
      >
        <div className="relative w-full h-40 bg-gradient-to-br from-green-50 to-teal-50 flex justify-center items-center overflow-hidden">
          {booksInCombo.length > 0 ? (
            <div className="relative w-full h-full">
              {booksInCombo[0] && (
                <img
                  src={booksInCombo[0].coverImage}
                  alt={booksInCombo[0].title || "Book 1"}
                  className="absolute w-20 h-28 object-cover rounded shadow-md
                               left-6 top-6 transform rotate-[-10deg] 
                               transition-transform duration-300 group-hover:rotate-[-15deg] group-hover:scale-105"
                />
              )}
              {booksInCombo[1] && (
                <img
                  src={booksInCombo[1].coverImage}
                  alt={booksInCombo[1].title || "Book 2"}
                  className="absolute w-24 h-32 object-cover rounded shadow-lg
                               left-1/2 -translate-x-1/2 top-4 z-10
                               transition-transform duration-300 group-hover:scale-110"
                />
              )}
              {booksInCombo[2] && (
                <img
                  src={booksInCombo[2].coverImage}
                  alt={booksInCombo[2].title || "Book 3"}
                  className="absolute w-20 h-28 object-cover rounded shadow-md
                               right-6 top-6 transform rotate-[10deg]
                               transition-transform duration-300 group-hover:rotate-[15deg] group-hover:scale-105"
                />
              )}
            </div>
          ) : (
            <div className="text-5xl text-gray-300">🎁</div>
          )}
        </div>
        <span
          className="absolute top-2 right-2 z-20 text-red-600 font-bold bg-red-100 
                     px-3 py-1 rounded-full self-start text-sm shadow-md
                     transition-transform duration-300 group-hover:scale-110"
        >
          {discountText}
        </span>
        <div className="p-4 flex-grow flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-gray-800 truncate">
              {combo.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {combo.description || "Ưu đãi trọn gói"}
            </p>
          </div>
          <div className="mt-auto pt-2 text-right">
            {" "}
            <span
              className="inline-block bg-green-600 text-white text-sm font-bold 
                         px-4 py-2 rounded-full group-hover:bg-green-700 transition-colors"
            >
              Xem Chi Tiết
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {/* Phần trên: SideNav + Slider */}
      <div className="col-span-1 !ml-30">
        <SideNav />
      </div>
      <div className="col-span-3 !ml-2 !mr-30">
        <Slider />

        {/* --- (KHUNG ƯU ĐÃI COMBO) --- */}
        <div className="border border-gray-300 shadow-md rounded-lg p-4 bg-white relative mt-4">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-md text-lg font-bold shadow-md">
            Ưu đãi Combo 🎁
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-600 rotate-45"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-600 rotate-4S"></div>
          </div>
          <div className="flex overflow-x-auto mt-6 space-x-4 p-2 pb-4">
            {loadingCombos ? (
              <p className="p-4 text-gray-600">Đang tải các ưu đãi...</p>
            ) : activeCombos.length > 0 ? (
              activeCombos.map(renderComboCard)
            ) : (
              <p className="p-4 text-gray-600">Hiện chưa có combo nào.</p>
            )}
          </div>
        </div>
        {/* --- KẾT THÚC KHUNG COMBO --- */}

        {/* Khung sách giảm giá */}
        <div className="border border-gray-300 shadow-md rounded-lg p-4 bg-white relative mt-4">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-md text-lg font-bold shadow-md">
            Giảm giá sốc
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rotate-45"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rotate-45"></div>
          </div>
          <div className="flex overflow-x-auto mt-6">
            {discountedBooks.map((book) => (
              <Book key={book.bookId} book={book} />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button
              onClick={handlePrevPage}
              disabled={discountedPage === 0}
              className="px-3 py-2 mx-2 bg-gray-200 !rounded-full"
            >
              &lt;
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              onClick={handleNextPage}
              disabled={discountedPage === discountedTotalPages - 1}
              className="px-3 py-2 mx-2 bg-gray-200 !rounded-full"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Phần dưới: Hiển thị các danh mục sách, Sách Bán Chạy Nhất, và Gợi ý */}
      <div className="col-span-4 !ml-30 !mr-30 !mt-2">
        
        {/* ⬇️ SỬA ĐỔI KHUNG SÁCH BÁN CHẠY NHẤT ⬇️ */}
        <div className="border border-gray-300 shadow-md rounded-lg p-4 bg-white relative mt-4">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-md text-lg font-bold shadow-md">
            Sách Bán Chạy Nhất 🚀
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rotate-45"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rotate-45"></div>
          </div>
          
          <div className="flex overflow-x-auto mt-6">
            {topSellingBooks.length > 0 ? (
              // Dùng mảng đã .slice()
              currentTopSellingBooks.map((book) => (
                <Book key={book.bookId} book={book} />
              ))
            ) : (
              <p className="p-4 text-gray-600">
                Đang tải sách bán chạy nhất hoặc không có dữ liệu.
              </p>
            )}
          </div>

          {/* Thêm nút Paging < và > */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button
              onClick={handlePrevTopSellingPage} // ⬅️ Dùng hàm mới
              disabled={topSellingPage === 0} // ⬅️ Dùng state mới
              className="px-3 py-2 mx-2 bg-gray-200 !rounded-full"
            >
              &lt;
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              onClick={handleNextTopSellingPage} // ⬅️ Dùng hàm mới
              disabled={topSellingPage === topSellingTotalPages - 1 || topSellingTotalPages === 0} // ⬅️ Dùng state mới
              className="px-3 py-2 mx-2 bg-gray-200 !rounded-full"
            >
              &gt;
            </button>
          </div>
        </div>
        {/* ⬆️ KẾT THÚC SỬA ĐỔI ⬆️ */}


        {/* ⬇️ SỬA ĐỔI KHUNG SÁCH GỢI Ý ⬇️ */}
        <div className="border border-gray-300 shadow-md rounded-lg p-4 bg-white relative mt-4">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-4 py-1 rounded-md text-lg font-bold shadow-md">
            Có thể bạn sẽ thích 🤔
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-teal-600 rotate-45"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-teal-600 rotate-45"></div>
          </div>
          
          <div className="flex overflow-x-auto mt-6">
            {suggestedBooks.length > 0 ? (
              // Dùng mảng đã .slice()
              currentSuggestedBooks.map((book) => (
                <Book key={book.bookId} book={book} />
              ))
            ) : (
              <p className="p-4 text-gray-600">
                Đang tìm sách có thể bạn sẽ thích...
              </p>
            )}
          </div>

          {/* Thêm nút Paging < và > */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button
              onClick={handlePrevSuggestedPage} // ⬅️ Dùng hàm mới
              disabled={suggestedPage === 0} // ⬅️ Dùng state mới
              className="px-3 py-2 mx-2 bg-gray-200 !rounded-full"
            >
              &lt;
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              onClick={handleNextSuggestedPage} // ⬅️ Dùng hàm mới
              disabled={suggestedPage === suggestedTotalPages - 1 || suggestedTotalPages === 0} // ⬅️ Dùng state mới
              className="px-3 py-2 mx-2 bg-gray-200 !rounded-full"
            >
              &gt;
            </button>
          </div>
        </div>
        {/* ⬆️ KẾT THÚC SỬA ĐỔI ⬆️ */}

        {/* Các danh mục sách (giữ nguyên) */}
        {Object.entries(books).map(([category, items]) => (
          <div
            key={category}
            className="border border-gray-300 rounded-lg shadow-md bg-white mt-2"
          >
            <div
              className="text-white w-full !p-2 rounded-t-md"
              style={{ backgroundColor: "#075990" }}
            >
              <h3 className="!text-xl p-1 flex items-center">
                <span role="img" aria-label="book" className="mr-2">
                  📖
                </span>
                {category}
              </h3>
            </div>
            <div className="flex items-center mt-2 p-0">
              <div className="flex overflow-x-auto">
                {items.map((book) => (
                  <Book key={book.bookId} book={book} />
                ))}
              </div>
              <button
                className={`!ml-4 flex items-center justify-center aspect-square !rounded-full transition-all duration-300 ease-in-out ${
                  isHovered && onHovered == category
                    ? "border-2 border-cyan-800 bg-cyan-800 text-white w-18"
                    : "border border-gray-800 bg-transparent text-gray-500 w-12"
                }`}
                onMouseEnter={() => {
                  setIsHovered(true);
                  setOnHoverd(category);
                }}
                onMouseLeave={() => {
                  setIsHovered(false);
                }}
                onClick={() =>
                  navigate(`/category/${encodeURIComponent(category)}`)
                }
              >
                {isHovered && onHovered == category ? "More..." : ">"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;