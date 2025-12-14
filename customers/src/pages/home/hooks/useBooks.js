import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { mainCategories } from "../../../constant";

export const useBooks = () => {
    const [books, setBooks] = useState({});

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Dùng Promise.all để gọi song song các danh mục
                const responses = await Promise.all(
                    Object.keys(mainCategories).map(category => 
                        axiosClient.get(`/book/mainCategory/${encodeURIComponent(category)}`, {
                            params: { page: 0, size: 5 }
                        }).then(res => ({ category, data: res.data.content || [] }))
                    )
                );

                const booksData = responses.reduce((acc, { category, data }) => {
                    acc[category] = data;
                    return acc;
                }, {});

                setBooks(booksData);
            } catch (error) {
                console.error("❌ Lỗi lấy danh mục sách:", error);
            }
        };

        fetchBooks();
    }, []);

    return { books };
}