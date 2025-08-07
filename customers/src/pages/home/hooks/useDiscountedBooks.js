import { useState, useEffect } from "react";
import axios from 'axios';
import { mainCategories } from "../../../constant";

export const useDiscountedBooks = (discountedPage) => {
    const [discountedBooks, setDiscountedBooks] = useState([]);
    const [discountedTotalPages, setDiscountedTotalPages] = useState(0);

    useEffect(() => {
        fetchDiscountedBooks();
    }, [discountedPage])

    const fetchDiscountedBooks = async () => {
        try {
        const response = await axios.get(
            `http://localhost:8081/api/book?page=${discountedPage}&size=5`
        );
        const discounted = response.data.content.filter(
            (book) => book.percentage > 0
        );
        setDiscountedBooks(discounted);
        setDiscountedTotalPages(response.data.totalPages);
        } catch (error) {
        console.error("Lỗi khi lấy danh sách sách giảm giá:", error);
        }
    };

    return {discountedBooks, discountedTotalPages};
}