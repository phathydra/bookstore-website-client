import { useState, useEffect } from "react";
import axios from 'axios';
import { mainCategories } from "../../../constant";

export const useBooksAndDiscountedBooks = (discountedPage) => {
    const [books, setBooks] = useState({});
    const [discountedBooks, setDiscountedBooks] = useState([]);
    const [discountedTotalPages, setDiscountedTotalPages] = useState(0);

    useEffect(() => {
        fetchBooks();
        fetchDiscountedBooks();
    }, [discountedPage])

    const fetchBooks = async () => {
        try {
        const responses = await Promise.all(
            Object.keys(mainCategories).map(async (mainCategory) => {
            const url = `http://localhost:8081/api/book/mainCategory/${encodeURIComponent(
                mainCategory
            )}?page=0&size=5`;
            const response = await axios.get(url);
            return { category: mainCategory, books: response.data };
            })
        );

        const booksData = responses.reduce((acc, { category, books }) => {
            acc[category] = books.content || [];
            return acc;
        }, {});

        setBooks(booksData);
        } catch (error) {
        console.error("Lỗi khi lấy danh sách sách:", error);
        }
    };

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

    return {books, discountedBooks, discountedTotalPages};
}