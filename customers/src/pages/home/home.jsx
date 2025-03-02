import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import Slider from "../../components/slider/slider.jsx";
import Book from "../../components/book/book.jsx"; 
import "./home.css";

const Home = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await axios.get("http://localhost:8081/api/book"); // Gọi API trực tiếp bằng axios
            console.log(response.data)
            setBooks(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sách:", error);
        }
    };

    return (
        <>
            <Slider />
            <div className="home-container">
                {(books?.content || []).map((book) => (
                    <Book book={book} key={book.bookId} />
                ))}
            </div>
        </>
    );
};

export default Home;
