import { useState, useEffect } from "react";
import axios from 'axios';

export const useFetchUpcomingDiscount = (status, page, rowsPerPage) => {
    const [upcoming, setUpcoming] = useState([]);

    useEffect(() => {
        if(status === "UPCOMING"){
            fetchUpcomingDiscount();
        }
    }, [status, page, rowsPerPage])

    const fetchUpcomingDiscount = async() => {
        try {
            const response = await axios.get(`http://localhost:8081/api/discounts/upcoming?page=${page}&size=${rowsPerPage}`);
            setUpcoming(response.data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        }
    };

    return upcoming;
}