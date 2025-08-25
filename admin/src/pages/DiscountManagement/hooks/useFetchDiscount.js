import { useState, useEffect } from "react";
import axios from 'axios';

export const useFetchDiscount = (status, page, rowsPerPage) => {
    const [discounts, setDiscounts] = useState([]);

    useEffect(() => {
        if(status === "ALL"){
            fetchDiscount();
        }
    }, [status, page, rowsPerPage])

    const fetchDiscount = async() => {
        try {
            const response = await axios.get(`http://localhost:8081/api/discounts?page=${page}&size=${rowsPerPage}`);
            setDiscounts(response.data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        }
    };

    return discounts;
}