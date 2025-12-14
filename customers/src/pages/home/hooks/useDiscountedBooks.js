import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";

export const useDiscountedBooks = (page) => {
    const [state, setState] = useState({ books: [], totalPages: 0 });

    useEffect(() => {
        axiosClient.get(`/book/discounted_books`, { params: { page, size: 5 } })
            .then(res => setState({ 
                books: res.data.content, 
                totalPages: res.data.totalPages 
            }))
            .catch(err => console.error("❌ Lỗi sách giảm giá:", err));
    }, [page]);

    return { discountedBooks: state.books, discountedTotalPages: state.totalPages };
}