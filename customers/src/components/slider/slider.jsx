import { useState, useEffect } from "react"; // Bỏ 'useRef'
import { Carousel, Image } from "react-bootstrap";
import axios from "axios";
import "./slider.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Slider() {
  // 1. Khởi tạo là mảng rỗng
  const [books, setBooks] = useState([]);

  // (Đã xóa mảng carouselRefs không sử dụng)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/book");
        
        // 2. Chỉ lưu mảng 'content' vào state
        // Đảm bảo fallback về mảng rỗng nếu 'content' không tồn tại
        setBooks(response.data.content || []); 
      
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sách:", error);
      }
    };

    fetchBooks();
  }, []); // [] đảm bảo chỉ chạy 1 lần

  return (
    <div>
      <div className="row slider-container">
        {/* Tạo 3 cột slider. 
          [0, 1, 2] là một mảng index để lặp 3 lần.
        */}
        {[0, 1, 2].map((index) => (
          <div key={index} className="col-4 slider-item-container">
            {/* Bỏ 'ref' không sử dụng.
              interval={5000} có vẻ hơi nhanh, bạn có thể chỉnh lại nếu muốn.
            */}
            <Carousel controls={false} indicators={false} interval={5000} pause={false}>
              
              {/* 3. Lặp trực tiếp 'books' vì nó đã là mảng */}
              {(books || []).slice(index * 3, index * 3 + 3).map((book, i) => (
                <Carousel.Item key={i}>
                  <Image
                    className="slider-item"
                    src={book.bookImage}
                    alt={book.bookName}
                    rounded
                  />
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