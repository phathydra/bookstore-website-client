import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "../../components/slider/slider.jsx";
import Book from "../../components/book/book.jsx";
import SideNav from "../../components/SideNav/SideNav";

const Home = () => {
    const [books, setBooks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // 🔥 Lưu danh mục đã chọn

    useEffect(() => {
        fetchBooks();
    }, [selectedCategory]); // 🔥 Khi danh mục thay đổi, gọi lại API

    const fetchBooks = async () => {
        try {
            let url = "http://localhost:8081/api/book";
            if (selectedCategory) {
                url = `http://localhost:8081/api/book/category/${encodeURIComponent(selectedCategory)}?page=0&size=10`; // 🔥 Gọi API theo danh mục
            }

            const response = await axios.get(url);
            console.log(response.data);
            setBooks(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sách:", error);
        }
    };

    return (
        <div className="flex">
            <SideNav onCategorySelect={setSelectedCategory} /> {/* 🔥 Truyền hàm vào SideNav */}
            <div className="flex-grow ml-12">
                <Slider />
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(books?.content || []).map((book) => (
                        <Book book={book} key={book.bookId} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
