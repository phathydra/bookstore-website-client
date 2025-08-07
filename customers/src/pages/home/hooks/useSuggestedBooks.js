import { useState, useEffect } from "react";
import axios from 'axios';
import { mainCategories } from "../../../constant";

export const useSuggestedBooks = (userId) => {
    const [suggestedBooks, setSuggestedBooks] = useState([]);

    useEffect(() => {
        fetchSuggestedBooks(userId);
    }, [userId])

  const fetchSuggestedBooks = async (userId) => {
    try {
      const purchasedBooksRes = await axios.get(`http://localhost:8082/api/orders/purchased-books/${userId}`);
      const purchasedBookIds = purchasedBooksRes.data.map(item => item.bookId);

      let allRecommendations = [];
      const uniqueRecommendedBookIds = new Set(); // Use a Set to store unique book IDs

      for (const bookId of purchasedBookIds) {
        try {
          const recommendationsRes = await axios.get(`http://localhost:8081/api/book/${bookId}/recommendations`);
          // Filter out books that have already been purchased by the user
          // and also ensure unique recommendations
          const newRecommendations = recommendationsRes.data.filter(recBook => 
            !purchasedBookIds.includes(recBook.bookId) && 
            !uniqueRecommendedBookIds.has(recBook.bookId)
          );
          
          newRecommendations.forEach(recBook => uniqueRecommendedBookIds.add(recBook.bookId));
          allRecommendations = [...allRecommendations, ...newRecommendations];
        } catch (error) {
          console.error(`Lỗi khi lấy gợi ý cho sách ${bookId}:`, error);
        }
      }
      setSuggestedBooks(allRecommendations);
    } catch (error) {
      console.error("Lỗi khi lấy sách đã mua để gợi ý:", error);
      setSuggestedBooks([]);
    }
  };

    return {suggestedBooks};
}