import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import Slider from "../../components/slider/slider.jsx";
import Book from "../../components/book/book.jsx"; 
import "./home.css";

const Home = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/book"); // Gọi API trực tiếp bằng axios
                setBooks(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách sách:", error);
            }
        };

        fetchBooks();
    }, []);

    return (
        <>
            <Slider />
            <div className="home-container">
                {books.map((book) => (
                    <Book book={book} key={book.bookId} />
                ))}
            </div>
        </>
    );
};

export default Home;
