import { useState, useEffect } from "react";
import axiosClient, { ORDER_API_URL } from "../../../api/axiosClient";
import axios from "axios";

export const useTopSellingBooks = () => {
  const [topSellingBooks, setTopSellingBooks] = useState([]);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        // 1. Lấy danh sách ID bán chạy từ Order Service
        const { data: topSellingData } = await axios.get(`${ORDER_API_URL}/orders/top-selling`);
        const top5 = topSellingData.slice(0, 5);

        // 2. Lấy chi tiết sách từ Main Service (Song song)
        const details = await Promise.all(
          top5.map(async (item) => {
            try {
              const res = await axiosClient.get(`/book/${item.bookId}`);
              // Gộp thông tin: Data sách + Số lượng đã bán
              return { ...res.data, totalSold: item.totalSold };
            } catch {
              return null; // Bỏ qua nếu sách bị lỗi/xóa
            }
          })
        );

        setTopSellingBooks(details.filter(Boolean));
      } catch (error) {
        console.error("❌ Lỗi lấy sách bán chạy:", error);
      }
    };

    fetchTopSelling();
  }, []);

  return { topSellingBooks };
};