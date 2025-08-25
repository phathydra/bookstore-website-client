import { useEffect, useState } from "react";
import axios from "axios";

export const useFetchActiveVoucher = (status, page, rowsPerPage) => {
    const [active, setActive] = useState([]);

    useEffect(() => {
        if(status === "ACTIVE"){
            fetchActiveVoucher();
        }
    },[status, page, rowsPerPage])

    const fetchActiveVoucher = async() => {
        try {
            const response = await axios.get(`http://localhost:8082/api/vouchers/active?page=${page}&size=${rowsPerPage}`);
            setActive(response.data);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        }
    }

    return active;
}