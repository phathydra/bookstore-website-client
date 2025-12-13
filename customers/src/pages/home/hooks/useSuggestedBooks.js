import { useState, useEffect } from "react";
import axiosClient, { AI_API_URL } from "../../../api/axiosClient";
import axios from "axios";

export const useSuggestedBooks = (userId, recentBookIds) => {
    const [suggestedBooks, setSuggestedBooks] = useState([]);

    useEffect(() => {
        if (!userId || !recentBookIds) {
            setSuggestedBooks([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                // Gọi AI Service
                const { data: recommendations } = await axios.post(
                    `${AI_API_URL}/api/recommend/hybrid-for-user/${userId}`, 
                    { recent_book_ids: recentBookIds }
                );

                if (!recommendations?.length) return;

                // Lấy chi tiết sách từ Backend
                const detailPromises = recommendations.map(rec => 
                    axiosClient.get(`/book/${rec.bookId}`).catch(() => null)
                );
                
                const responses = await Promise.all(detailPromises);
                const validBooks = responses
                    .filter(res => res && res.data)
                    .map(res => res.data);

                setSuggestedBooks(validBooks);
            } catch (error) {
                console.error("⚠️ Lỗi gợi ý AI:", error.message);
            }
        };

        fetchSuggestions();
    }, [userId, recentBookIds]); // Dependency chuẩn

    return { suggestedBooks };
}