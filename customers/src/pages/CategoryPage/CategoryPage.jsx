import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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

const CategoryPage = () => {
    const { categoryName } = useParams();  // Lấy danh mục từ URL
    const [books, setBooks] = useState([]);

    console.log("CategoryPage Rendered");  
    console.log("Category Name from URL:", categoryName);

    useEffect(() => {
        const fetchBooksByCategory = async () => {
            try {
                console.log(`Fetching books for category: ${categoryName}`);

                // Xác định xem danh mục hiện tại là danh mục cha hay danh mục con
                let isMainCategory = Object.keys(mainCategories).includes(categoryName);
                let apiUrl = isMainCategory
                    ? `http://localhost:8081/api/book/mainCategory/${encodeURIComponent(categoryName)}?page=0&size=10`
                    : `http://localhost:8081/api/book/bookCategory/${encodeURIComponent(categoryName)}?page=0&size=10`;

                console.log("API URL:", apiUrl);
                const response = await axios.get(apiUrl);
                
                console.log("Fetched books:", response.data);
                setBooks(response.data.content || []);
            } catch (error) {
                console.error("Lỗi khi lấy sách:", error);
            }
        };

        if (categoryName) {
            fetchBooksByCategory();
        }
    }, [categoryName]);

    return (
        <div className="flex">
            {/* Sidebar */}
            <SideNav />

            {/* Danh sách sách */}
            <div className="flex-1 p-4">
                <h2 className="text-2xl font-bold mb-4">
                    Danh mục: {categoryName}
                </h2>

                {/* Kiểm tra nếu chưa có sách */}
                {books.length === 0 ? (
                    <p className="text-gray-500">Không có sách nào trong danh mục này.</p>
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {books.map((book) => (
                            <Book key={book.id} book={book} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
