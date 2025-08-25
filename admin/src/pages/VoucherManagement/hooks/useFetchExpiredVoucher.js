import { useEffect, useState } from "react";
import axios from "axios";

export const useFetchExpiredVoucher = (status, page, rowsPerPage) => {
    const [expired, setExpired] = useState([]);

    useEffect(() => {
        if(status === "EXPIRED"){
            fetchExpiredVoucher();
        }
    },[status, page, rowsPerPage])

    const fetchExpiredVoucher = async() => {
        try {
            const response = await axios.get(`http://localhost:8082/api/vouchers/expired?page=${page}&size=${rowsPerPage}`);
            setExpired(response.data);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        }
    }

    return expired;
}