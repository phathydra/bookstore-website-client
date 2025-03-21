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
    "Sức Khỏe & Ẩm Thực": ["Nấu ăn", "Dinh dưỡng", "Thể dục - thể thao"]
};

const Home = () => {
    const [books, setBooks] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, [selectedCategory]); // 🔥 Khi danh mục thay đổi, gọi lại API

    const fetchBooks = async () => {
        try {
            const responses = await Promise.all(
                Object.keys(mainCategories).map(async (mainCategory) => {
                    const url = `http://localhost:8081/api/book/mainCategory/${encodeURIComponent(mainCategory)}?page=0&size=4`;
                    const response = await axios.get(url);
                    return { category: mainCategory, books: response.data }; // Return structured data
                })
            );
    
            const booksData = responses.reduce((acc, { category, books }) => {
                acc[category] = books.content || [];
                return acc;
            }, {});

            console.log(booksData)
    
            setBooks(booksData);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sách:", error);
        }
    };    

    return (
        <div className="flex">
            <SideNav onCategorySelect={setSelectedCategory} /> {/* 🔥 Truyền hàm vào SideNav */}
            <div className="flex-grow ml-12">
                <Slider />
                {Object.entries(books).map(([category, items]) => (
                    <div className="flex-1 p-4">
                        <div className="text-white w-full p-4 rounded-md" style={{ backgroundColor: "#003333" }}>
                            <h3 className="text-2xl">{category}</h3>
                        </div>
                        <div className="flex items-center mt-4">
                            {/* Books List */}
                            <div className="flex gap-4">
                                {items.map((book) => (
                                    <Book key={book.id} book={book} />
                                ))}
                            </div>

                            {/* Navigation Button - placed next to last book */}
                            <button
                                className={`ml-4 flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold  aspect-square rounded-full shadow-lg transition-all duration-300 ease-in-out 
                                    ${isHovered ? "w-18" : "w-12"}`}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
                            >
                                {isHovered ? "More" : ">"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
