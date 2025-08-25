import { useEffect, useState } from "react";
import axios from "axios";

export const useFetchUpcomingVoucher = (status, page, rowsPerPage) => {
    const [upcoming, setUpcoming] = useState([]);

    useEffect(() => {
        if(status === "UPCOMING"){
            fetchUpcomingVoucher();
        }
    },[status, page, rowsPerPage])

    const fetchUpcomingVoucher = async() => {
        try {
            const response = await axios.get(`http://localhost:8082/api/vouchers/upcoming?page=${page}&size=${rowsPerPage}`);
            setUpcoming(response.data);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        }
    }

    return upcoming;
}