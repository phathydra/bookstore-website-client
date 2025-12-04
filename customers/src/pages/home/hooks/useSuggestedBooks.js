import { useState, useEffect } from "react";
import axios from 'axios';

const AI_API_URL = "http://127.0.0.1:8000";
const BACKEND_API_URL = "http://localhost:8081/api";

export const useSuggestedBooks = (userId) => {
    const [suggestedBooks, setSuggestedBooks] = useState([]);

    useEffect(() => {
        if (!userId) {
            setSuggestedBooks([]);
            return;
        }

        const fetchSuggestions = async (id) => {
            try {
                const aiRes = await axios.get(`${AI_API_URL}/api/recommend/profile-based/${id}`);
                
                const recommendations = aiRes.data;

                if (!recommendations || recommendations.length === 0) {
                    setSuggestedBooks([]);
                    return;
                }

                const bookDetailPromises = recommendations.map(rec => 
                    axios.get(`${BACKEND_API_URL}/book/${rec.bookId}`)
                );

                const bookDetailResponses = await Promise.allSettled(bookDetailPromises);

                const fullBookObjects = bookDetailResponses
                    .filter(res => res.status === 'fulfilled' && res.value.data)
                    .map(res => res.value.data);

                setSuggestedBooks(fullBookObjects);

            } catch (error) {
                console.error("Lỗi khi lấy gợi ý 'Có thể bạn sẽ thích' (AI Service):", error.message);
                setSuggestedBooks([]);
            }
        };

        fetchSuggestions(userId);

    }, [userId]);

    return { suggestedBooks };
}