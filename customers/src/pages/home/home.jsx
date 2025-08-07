import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "../../components/slider/slider.jsx";
import Book from "../../components/book/book.jsx";
import SideNav from "../../components/SideNav/SideNav.jsx";
import { useBooksAndDiscountedBooks } from "./hooks/useBooksAndDiscountedBooks.js";

const Home = () => {
  const [discountedPage, setDiscountedPage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [onHovered, setOnHoverd] = useState(null);
  const navigate = useNavigate();

  const {books, discountedBooks, discountedTotalPages} = useBooksAndDiscountedBooks(discountedPage);

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

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {/* Phần trên: SideNav + Slider */}
      <div className="col-span-1 !ml-30">
        <SideNav/>
      </div>
      <div className="col-span-3 !ml-2 !mr-30">
        <Slider />

        {/* giam gia*/}
        <div className="border border-gray-300 shadow-md rounded-lg p-4  bg-white relative">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-md text-lg font-bold shadow-md">
                Giảm giá sốc
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rotate-45"></div>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rotate-45"></div>
            </div>

            <div className="flex overflow-x-auto mt-6">
                {discountedBooks.map((book) => (
                <Book key={book.id} book={book} />
                ))}
            </div>

            {/* Thay đổi vị trí của các nút */}
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

      {/* Phần dưới: Hiển thị danh sách sách theo category */}
      <div className="col-span-4 !ml-30 và !mr-30 !mt-2"> 
        {Object.entries(books).map(([category, items]) => (
            <div
            key={category}
            className="border border-gray-300 rounded-lg shadow-md bg-white mt-2"
            >
            <div
                className="text-white w-full !p-2 rounded-t-md"
                style={{ backgroundColor: "#075990" }}
            >
                  <h3 className="!text-xl p-1 flex items-center"> {/* Thêm flex và items-center */}
                    <span role="img" aria-label="book" className="mr-2">
                    📖 {/* Icon cuốn sách */}
                    </span>
                    {category}
                </h3>
            </div>
                <div className="flex items-center mt-2 p-0">
                    <div className="flex overflow-x-auto">
                    {items.map((book) => (
                        <Book key={book.id} book={book} />
                    ))}
                    </div>
                    <button
                    className={`!ml-4 flex items-center justify-center aspect-square !rounded-full transition-all duration-300 ease-in-out ${
                        isHovered && onHovered == category
                        ? "border-2 border-cyan-800 bg-cyan-800 text-white w-18"
                        : "border border-gray-800 bg-transparent text-gray-500 w-12"
                    }`}
                    onMouseEnter={() => {setIsHovered(true); setOnHoverd(category)}}
                    onMouseLeave={() => {setIsHovered(false)}}
                    onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
                    >
                    {isHovered && onHovered == category? "More..." : ">"}
                    </button>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
};

export default Home;