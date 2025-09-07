import { useState, useEffect } from "react";
import axios from "axios";

export const useTopSellingBooks = () => {
  const [topSellingBooks, setTopSellingBooks] = useState([]);

  useEffect(() => {
    fetchTopSellingBooks();
  }, []);

  const fetchTopSellingBooks = async () => {
    try {
      const topSellingResponse = await axios.get(
        "http://localhost:8082/api/orders/top-selling"
      );
      const topSellingData = topSellingResponse.data.slice(0, 5);

      const detailedTopSellingBooks = await Promise.all(
        topSellingData.map(async (book) => {
          try {
            const detailResponse = await axios.get(
              `http://localhost:8081/api/book/${book.bookId}`
            );
            return { ...detailResponse.data, totalSold: book.totalSold };
          } catch (error) {
            if (error.response && error.response.status === 404) {
              console.warn(
                `⚠️ Sách với ID ${book.bookId} không tồn tại, bỏ qua.`
              );
              return null; // bỏ qua sách đã xoá
            }
            console.error(
              `❌ Lỗi khi lấy chi tiết sách ${book.bookId}:`,
              error
            );
            return null;
          }
        })
      );

      setTopSellingBooks(detailedTopSellingBooks.filter(Boolean));
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách sách bán chạy:", error);
    }
  };

  return { topSellingBooks };
};
