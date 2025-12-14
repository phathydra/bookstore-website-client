import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem } from '@mui/material';
import axios from 'axios';

const UpdateDiscount = ({ selectedDiscount, onClose }) => {
  const [formData, setFormData] = useState({
    percentage: '',
    startDate: '',
    endDate: '',
    type: 'NORMAL'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HELPER: Convert UTC từ Server -> Local String cho Input HTML ---
  const formatDateForInput = (dateString, type) => {
      if (!dateString) return '';
      const date = new Date(dateString);

      // Lấy các thành phần ngày giờ theo giờ địa phương (Local Time)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      if (type === 'FLASH_SALE') {
          // Format cho input datetime-local: "YYYY-MM-DDTHH:mm"
          return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      // Format cho input date: "YYYY-MM-DD"
      return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (selectedDiscount) {
      setFormData({
        percentage: selectedDiscount.percentage,
        startDate: formatDateForInput(selectedDiscount.startDate, selectedDiscount.type),
        endDate: formatDateForInput(selectedDiscount.endDate, selectedDiscount.type),
        type: selectedDiscount.type || 'NORMAL'
      });
    }
  }, [selectedDiscount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        setError('Ngày kết thúc phải lớn hơn ngày bắt đầu!');
        return;
    }

    setIsLoading(true);
    try {
      let finalStartDate;
      let finalEndDate;

      if (formData.type === 'NORMAL') {
        // Normal: Input là YYYY-MM-DD (Local) -> Thêm giờ -> Convert sang ISO (UTC)
        const startObj = new Date(`${formData.startDate}T00:00:00`);
        const endObj = new Date(`${formData.endDate}T23:59:59`);
        
        finalStartDate = startObj.toISOString();
        finalEndDate = endObj.toISOString();
      } else {
        // Flash Sale: Input là YYYY-MM-DDTHH:mm (Local) -> Convert sang ISO (UTC)
        const startObj = new Date(formData.startDate);
        const endObj = new Date(formData.endDate);

        finalStartDate = startObj.toISOString();
        finalEndDate = endObj.toISOString();
      }

      const payload = {
          ...formData,
          startDate: finalStartDate,
          endDate: finalEndDate
      };

      await axios.put(`http://localhost:8081/api/discounts/${selectedDiscount.id}`, payload);
      
      onClose();
      window.location.reload(); 
    } catch (error) {
      console.error('Error updating discount:', error);
      setError('Lỗi khi cập nhật mã giảm giá.');
    } finally {
      setIsLoading(false);
    }
  };

  const dateInputType = formData.type === 'FLASH_SALE' ? 'datetime-local' : 'date';

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <Typography variant="h6" mb={2} fontWeight="bold" textAlign="center">Cập Nhật Mã Giảm Giá</Typography>
        
        {error && (
            <Box mb={2} p={1} bgcolor="#ffebee" color="#c62828" borderRadius={1} textAlign="center">
                {error}
            </Box>
        )}

        <form onSubmit={handleUpdate}>
          
          <TextField
            select
            label="Loại chương trình"
            name="type"
            fullWidth
            value={formData.type}
            onChange={handleChange}
            margin="normal"
            disabled // Không cho sửa loại khi update để tránh lỗi logic
          >
             <MenuItem value="NORMAL">Giảm giá thường</MenuItem>
             <MenuItem value="FLASH_SALE">Flash Sale</MenuItem>
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
            label="Ngày bắt đầu"
            name="startDate"
            type={dateInputType}
            fullWidth
            value={formData.startDate}
            onChange={handleChange}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText={formData.type === 'NORMAL' ? "Bắt đầu từ 00:00:00" : ""}
          />
          
          <TextField
            label="Ngày kết thúc"
            name="endDate"
            type={dateInputType}
            fullWidth
            value={formData.endDate}
            onChange={handleChange}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText={formData.type === 'NORMAL' ? "Kết thúc lúc 23:59:59" : ""}
          />
          
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} disabled={isLoading} variant="outlined" color="inherit">Hủy</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UpdateDiscount;