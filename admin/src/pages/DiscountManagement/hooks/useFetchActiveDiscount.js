import { useState, useEffect } from "react";
import axios from 'axios';

export const useFetchActiveDiscount = (status, page, rowsPerPage) => {
    const [active, setActive] = useState([]);

    useEffect(() => {
        if(status === "ACTIVE"){
            fetchActiveDiscount();
        }
    }, [status, page, rowsPerPage])

    const fetchActiveDiscount = async() => {
        try {
            const response = await axios.get(`http://localhost:8081/api/discounts/active?page=${page}&size=${rowsPerPage}`);
            setActive(response.data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        }
    };

    return active;
}