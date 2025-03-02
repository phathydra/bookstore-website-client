import { useState, useEffect, useRef } from "react";
import { Carousel, Image } from "react-bootstrap";
import axios from "axios"; // Import axios
import "./slider.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Slider() {
    const [books, setBooks] = useState([]);
    const carouselRefs = [useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/book"); // Gọi API bằng axios
                setBooks(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách sách:", error);
            }
        };

        fetchBooks();
    }, []);

    return (
        <div>
            <div className="row slider-container">
                {carouselRefs.map((ref, index) => (
                    <div key={index} className="col-4 slider-item-container">
                        <Carousel ref={ref} controls={false} indicators={false} interval={5000} pause={false}>
                            {(books?.content || []).slice(index * 3, index * 3 + 3).map((book, i) => (
                                <Carousel.Item key={i}>
                                    <Image className="slider-item" src={book.bookImage} alt={book.bookName} rounded />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Slider;
