import { useEffect, useState } from "react";
import axios from "axios";

export const useFetchVoucher = (status, page, rowsPerPage, searchTerm) => {
    const [vouchers, setVouchers] = useState([]);

    useEffect(() => {
        if(status === "ALL"){
            fetchVoucher();
        }
    },[status, page, rowsPerPage, searchTerm])

    const fetchVoucher = async() => {
        try {
            const response = await axios.get(`http://localhost:8082/api/vouchers?page=${page}&size=${rowsPerPage}&code=${searchTerm}`);
            setVouchers(response.data);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        }
    }

    return vouchers;
}