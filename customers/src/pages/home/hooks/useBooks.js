import { useState, useEffect } from "react";
import axios from 'axios';
import { mainCategories } from "../../../constant";

export const useBooks = () => {
    const [books, setBooks] = useState({});

    useEffect(() => {
        fetchBooks();
    }, [])

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

    return {books};
}