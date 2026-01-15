import { useState, useEffect } from "react";
import axios from "axios";
import axiosClient, { AI_API_URL } from "../../../api/axiosClient";

export const useSuggestedBooks = (userId, recentBookIds) => {
    const [suggestedBooks, setSuggestedBooks] = useState([]);

    useEffect(() => {
        // Nếu không có user hoặc chưa có lịch sử xem -> Không gợi ý (hoặc trả về mảng rỗng)
        if (!userId) {
            setSuggestedBooks([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                console.log("🤖 Đang gọi AI Recommend cho User:", userId);

                // 1. Gọi AI Service (Port 8086)
                // Lưu ý: Param là userId (được truyền vào từ Home), body là danh sách ID sách xem gần đây
                const { data } = await axios.get(
                    `${AI_API_URL}/recommend/${userId}?k=10`, // API Python của bạn: /recommend/{user_id}
                    { recent_book_ids: recentBookIds || [] }   // Body gửi danh sách ID
                );
                
                // Giả sử Python trả về format: { recommendations: [id1, id2, ...] }
                // Nếu Python trả về trực tiếp mảng, hãy sửa thành: const recommendationIds = data;
                const recommendationIds = data.recommendations || data;

                if (!recommendationIds || recommendationIds.length === 0) return;

                // 2. Lấy chi tiết sách từ Backend chính (Port 8081)
                const detailPromises = recommendationIds.map(bookId => 
                    axiosClient.get(`/book/${bookId}`).catch(() => null)
                );
                
                const responses = await Promise.all(detailPromises);
                
                // Lọc bỏ các request lỗi (null) và lấy data
                const validBooks = responses
                    .filter(res => res && res.data)
                    .map(res => res.data);

                setSuggestedBooks(validBooks);

            } catch (error) {
                console.error("⚠️ Lỗi khi lấy gợi ý AI:", error);
                setSuggestedBooks([]); // Fallback về rỗng nếu lỗi
            }
        };

        fetchSuggestions();
    }, [userId, recentBookIds]); // Chạy lại khi userId hoặc danh sách xem thay đổi

    return { suggestedBooks };
};