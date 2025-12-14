import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem } from '@mui/material';
import axios from 'axios';

const AddDiscount = ({ onClose }) => {
  const [formData, setFormData] = useState({
    percentage: '',
    startDate: '',
    endDate: '',
    type: 'NORMAL' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');

    // VALIDATION CƠ BẢN
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        setError('Ngày kết thúc phải lớn hơn ngày bắt đầu!');
        return;
    }

    setIsLoading(true);

    try {
      let finalStartDate;
      let finalEndDate;

      if (formData.type === 'NORMAL') {
        // --- NORMAL: Bắt đầu 00:00:00 và Kết thúc 23:59:59 (Giờ địa phương) ---
        // Tạo Date object dựa trên giờ địa phương của máy tính người dùng
        const startObj = new Date(`${formData.startDate}T00:00:00`);
        const endObj = new Date(`${formData.endDate}T23:59:59`);

        // Chuyển sang UTC để gửi về Server (Server MongoDB luôn lưu UTC)
        finalStartDate = startObj.toISOString();
        finalEndDate = endObj.toISOString();

      } else {
        // --- FLASH SALE: Lấy chính xác giờ phút người dùng chọn ---
        const startObj = new Date(formData.startDate);
        const endObj = new Date(formData.endDate);

        // Chuyển sang UTC
        finalStartDate = startObj.toISOString();
        finalEndDate = endObj.toISOString();
      }

      const payload = {
          ...formData,
          startDate: finalStartDate,
          endDate: finalEndDate
      };
      
      console.log("Payload gửi đi:", payload); // Debug xem giờ giấc đúng chưa

      await axios.post('http://localhost:8081/api/discounts', payload);
      
      // Thành công
      onClose();
      // Nên dùng callback để refresh list thay vì reload trang, nhưng reload tạm thời vẫn ok
      window.location.reload(); 
    } catch (error) {
      console.error('Error adding discount:', error);
      setError('Lỗi khi thêm mã giảm giá. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xác định input type
  const dateInputType = formData.type === 'FLASH_SALE' ? 'datetime-local' : 'date';

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <Typography variant="h5" component="h2" mb={3} fontWeight="bold" textAlign="center">
          Thêm Mã Giảm Giá
        </Typography>
        
        {error && (
            <Box mb={2} p={1} bgcolor="#ffebee" color="#c62828" borderRadius={1} textAlign="center">
                {error}
            </Box>
        )}

        <form onSubmit={handleAdd}>
          
          <TextField
            select
            label="Loại chương trình"
            name="type"
            fullWidth
            value={formData.type}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          >
             <MenuItem value="NORMAL">Giảm giá thường (Theo ngày)</MenuItem>
             <MenuItem value="FLASH_SALE">Flash Sale (Theo giờ phút)</MenuItem>
          </TextField>

          <TextField
            label="Mức giảm (%)"
            name="percentage"
            type="number"
            fullWidth
            value={formData.percentage}
            onChange={handleChange}
            required
            margin="normal"
            inputProps={{ min: 1, max: 100 }}
          />
          
          <TextField
            label="Thời gian bắt đầu"
            name="startDate"
            type={dateInputType}
            fullWidth
            value={formData.startDate}
            onChange={handleChange}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText={formData.type === 'NORMAL' ? "Tính từ 00:00:00 của ngày chọn" : ""}
          />
          
          <TextField
            label="Thời gian kết thúc"
            name="endDate"
            type={dateInputType}
            fullWidth
            value={formData.endDate}
            onChange={handleChange}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText={formData.type === 'NORMAL' ? "Tính đến 23:59:59 của ngày chọn" : ""}
          />
          
          <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} disabled={isLoading} variant="outlined" color="inherit">
                Hủy bỏ
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Xác nhận thêm'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddDiscount;