import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "../../components/slider/slider.jsx";
import Book from "../../components/book/book.jsx";
import SideNav from "../../components/SideNav/SideNav";

const mainCategories = {
  "Văn Học": ["Tiểu thuyết", "Truyện ngắn", "Thơ ca", "Kịch", "Ngụ ngôn"],
  "Giáo Dục & Học Thuật": ["Sách giáo khoa", "Sách tham khảo", "Ngoại ngữ", "Sách khoa học"],
  "Kinh Doanh & Phát Triển Bản Thân": ["Quản trị", "Tài chính", "Khởi nghiệp", "Lãnh đạo", "Kỹ năng sống"],
  "Khoa Học & Công Nghệ": ["Vật lý", "Hóa học", "Sinh học", "Công nghệ", "Lập trình"],
  "Lịch Sử & Địa Lý": ["Lịch sử thế giới", "Lịch sử Việt Nam", "Địa lý"],
  "Tôn Giáo & Triết Học": ["Phật giáo", "Thiên Chúa giáo", "Hồi giáo", "Triết học"],
  "Sách Thiếu Nhi": ["Truyện cổ tích", "Truyện tranh", "Sách giáo dục trẻ em"],
  "Văn Hóa & Xã Hội": ["Du lịch", "Nghệ thuật", "Tâm lý - xã hội"],
  "Sức Khỏe & Ẩm Thực": ["Nấu ăn", "Dinh dưỡng", "Thể dục - thể thao"],
};

const Home = () => {
  const [books, setBooks] = useState({});
  const [discountedBooks, setDiscountedBooks] = useState([]);
  const [topSellingBooks, setTopSellingBooks] = useState([]);
  const [suggestedBooks, setSuggestedBooks] = useState([]); // State mới cho sách gợi ý
  const [discountedPage, setDiscountedPage] = useState(0);
  const [discountedTotalPages, setDiscountedTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [onHovered, setOnHoverd] = useState(null);
  const navigate = useNavigate();

  // IMPORTANT: Replace this with the actual user ID from your authentication system
  const USER_ID = "68064b397faaf761a304742a"; 

  useEffect(() => {
    fetchBooks();
    fetchDiscountedBooks();
    fetchTopSellingBooks();
    fetchSuggestedBooks(USER_ID); // Gọi hàm lấy sách gợi ý
  }, [selectedCategory, discountedPage, USER_ID]); // Thêm USER_ID vào dependency array

  const fetchBooks = async () => {
    try {
      const responses = await Promise.all(
        Object.keys(mainCategories).map(async (mainCategory) => {
          const url = `http://localhost:8081/api/book/mainCategory/${encodeURIComponent(
            mainCategory
          )}?page=0&size=5`;
          const response = await axios.get(url);
          return { category: mainCategory, books: response.data };
        })
      );

      const booksData = responses.reduce((acc, { category, books }) => {
        acc[category] = books.content || [];
        return acc;
      }, {});

      setBooks(booksData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sách:", error);
    }
  };

  const fetchDiscountedBooks = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/book?page=${discountedPage}&size=5`
      );
      const discounted = response.data.content.filter(
        (book) => book.percentage > 0
      );
      setDiscountedBooks(discounted);
      setDiscountedTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sách giảm giá:", error);
    }
  };

  const fetchTopSellingBooks = async () => {
    try {
      const topSellingResponse = await axios.get("http://localhost:8082/api/orders/top-selling");
      const topSellingData = topSellingResponse.data.slice(0, 5); 

      const detailedTopSellingBooks = await Promise.all(
        topSellingData.map(async (book) => {
          try {
            const detailResponse = await axios.get(`http://localhost:8081/api/book/${book.bookId}`);
            return { ...detailResponse.data, totalSold: book.totalSold }; 
          } catch (error) {
            console.error(`Lỗi khi lấy chi tiết sách ${book.bookId}:`, error);
            return null; 
          }
        })
      );
      setTopSellingBooks(detailedTopSellingBooks.filter(Boolean));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sách bán chạy:", error);
    }
  };

  const fetchSuggestedBooks = async (userId) => {
    try {
      const purchasedBooksRes = await axios.get(`http://localhost:8082/api/orders/purchased-books/${userId}`);
      const purchasedBookIds = purchasedBooksRes.data.map(item => item.bookId);

      let allRecommendations = [];
      const uniqueRecommendedBookIds = new Set(); // Use a Set to store unique book IDs

      for (const bookId of purchasedBookIds) {
        try {
          const recommendationsRes = await axios.get(`http://localhost:8081/api/book/${bookId}/recommendations`);
          // Filter out books that have already been purchased by the user
          // and also ensure unique recommendations
          const newRecommendations = recommendationsRes.data.filter(recBook => 
            !purchasedBookIds.includes(recBook.bookId) && 
            !uniqueRecommendedBookIds.has(recBook.bookId)
          );
          
          newRecommendations.forEach(recBook => uniqueRecommendedBookIds.add(recBook.bookId));
          allRecommendations = [...allRecommendations, ...newRecommendations];
        } catch (error) {
          console.error(`Lỗi khi lấy gợi ý cho sách ${bookId}:`, error);
        }
      }
      setSuggestedBooks(allRecommendations);
    } catch (error) {
      console.error("Lỗi khi lấy sách đã mua để gợi ý:", error);
      setSuggestedBooks([]);
    }
  };

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
        <SideNav onCategorySelect={setSelectedCategory} />
      </div>
      <div className="col-span-3 !ml-2 !mr-30">
        <Slider />

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
        {/* Khung sách bán chạy nhất */}
        <div className="border border-gray-300 shadow-md rounded-lg p-4 bg-white relative mt-4">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-md text-lg font-bold shadow-md">
            Sách Bán Chạy Nhất 🚀
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rotate-45"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rotate-45"></div>
          </div>

          <div className="flex overflow-x-auto mt-6">
            {topSellingBooks.length > 0 ? (
              topSellingBooks.map((book) => (
                <Book key={book.bookId} book={book} />
              ))
            ) : (
              <p className="p-4 text-gray-600">Đang tải sách bán chạy nhất hoặc không có dữ liệu.</p>
            )}
          </div>
        </div>

        {/* Khung sách gợi ý */}
        <div className="border border-gray-300 shadow-md rounded-lg p-4 bg-white relative mt-4">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-md text-lg font-bold shadow-md">
            Gợi ý cho bạn ✨
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-600 rotate-45"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-600 rotate-45"></div>
          </div>

          <div className="flex overflow-x-auto mt-6">
            {suggestedBooks.length > 0 ? (
              suggestedBooks.map((book) => (
                <Book key={book.bookId} book={book} />
              ))
            ) : (
              <p className="p-4 text-gray-600">Đang tìm gợi ý sách dành cho bạn...</p>
            )}
          </div>
        </div>


        {/* Các danh mục sách */}
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