import { useState, useEffect } from 'react';
// Import hàm service bạn vừa tạo ở Bước 1
import { getActiveCombos } from '../../combo/comboService'; 

export const useActiveCombos = () => {
  const [activeCombos, setActiveCombos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCombos = async () => {
      setLoading(true);
      try {
        const response = await getActiveCombos();
        // Giả sử API trả về mảng combo trong response.data
        setActiveCombos(response.data || []); 
      } catch (error) {
        console.error("Lỗi khi tải danh sách combo:", error);
        setActiveCombos([]); // Set mảng rỗng nếu có lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []); // Chỉ chạy 1 lần

  return { activeCombos, loadingCombos: loading };
};