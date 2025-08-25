import { useState, useEffect } from "react";
import axios from 'axios';

export const useFetchExpiredDiscount = (status, page, rowsPerPage) => {
    const [expired, setExpired] = useState([]);

    useEffect(() => {
        if(status === "EXPIRED"){
            fetchExpiredDiscount();
        }
    }, [status, page, rowsPerPage])

    const fetchExpiredDiscount = async() => {
        try {
            const response = await axios.get(`http://localhost:8081/api/discounts/expired?page=${page}&size=${rowsPerPage}`);
            setExpired(response.data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        }
    };

    return expired;
}