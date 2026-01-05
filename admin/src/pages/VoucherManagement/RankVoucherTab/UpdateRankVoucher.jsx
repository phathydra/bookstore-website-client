import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import axios from 'axios';

// 1. Nhận đúng prop 'voucher' và 'onSuccess'
const UpdateRankVoucher = ({ voucher, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    voucherType: 'Percentage Discount',
    percentageDiscount: '',
    valueDiscount: '',
    highestDiscountValue: '',
    minOrderValue: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    rank: '', // Lưu ý: Backend có thể trả về 'requiredRank' hoặc 'rank'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm helper xử lý ngày tháng an toàn
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    // 2. Kiểm tra biến 'voucher' được truyền vào
    if (voucher) {
      console.log("Data loaded into update form (Rank):", voucher); 
      setFormData({
        code: voucher.code || '',
        voucherType: voucher.voucherType || 'Percentage Discount',
        percentageDiscount: voucher.percentageDiscount || '',
        valueDiscount: voucher.valueDiscount || '',
        highestDiscountValue: voucher.highestDiscountValue || '',
        minOrderValue: voucher.minOrderValue || '',
        usageLimit: voucher.usageLimit || '',
        // Mapping cả 2 trường hợp tên biến rank
        rank: voucher.rank || voucher.requiredRank || '', 
        startDate: formatDateForInput(voucher.startDate),
        endDate: formatDateForInput(voucher.endDate),
      });
    }
  }, [voucher]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name.includes("Discount") || name.includes("Value") || name === "usageLimit" || name === "rank" 
        ? (value === '' ? '' : Number(value)) 
        : value;
    setFormData({ ...formData, [name]: val });
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Gọi API update
      await axios.put(`http://localhost:8082/api/vouchers/rank/${voucher.id}`, formData);
      alert("Cập nhật thành công!");
      if (onSuccess) onSuccess(); // Reload lại danh sách bên ngoài
      onClose();
    } catch (error) {
      console.error('Error updating rank voucher:', error);
      setError('Lỗi khi cập nhật Rank Voucher.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
        sx={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1300,
            display: 'flex', justifyContent: 'center', alignItems: 'center' 
        }}
    >
      <Box
        sx={{ bgcolor: 'white', p: 4, borderRadius: 2, width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <Typography variant="h6" mb={2}>Cập nhật Rank Voucher</Typography>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        
        <form onSubmit={handleUpdate}>
          <Box display="flex" gap={2} flexWrap="wrap">
            {/* Cột Trái */}
            <Box flex={1} minWidth="300px">
              <TextField
                label="Code"
                name="code"
                fullWidth
                value={formData.code}
                onChange={handleChange}
                required
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="voucher-type-label">Loại Voucher</InputLabel>
                <Select
                  labelId="voucher-type-label"
                  name="voucherType"
                  value={formData.voucherType}
                  onChange={handleChange}
                  required
                  label="Loại Voucher"
                >
                  <MenuItem value="Percentage Discount">Percentage Discount</MenuItem>
                  <MenuItem value="Value Discount">Value Discount</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Percentage Discount (%)"
                name="percentageDiscount"
                type="number"
                fullWidth
                value={formData.percentageDiscount}
                onChange={handleChange}
                margin="normal"
                disabled={formData.voucherType !== "Percentage Discount"}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Value Discount"
                name="valueDiscount"
                type="number"
                fullWidth
                value={formData.valueDiscount}
                onChange={handleChange}
                margin="normal"
                disabled={formData.voucherType !== "Value Discount"}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Highest Discount Value"
                name="highestDiscountValue"
                type="number"
                fullWidth
                value={formData.highestDiscountValue}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Cột Phải */}
            <Box flex={1} minWidth="300px">
              <TextField
                label="Min Order Value"
                name="minOrderValue"
                type="number"
                fullWidth
                value={formData.minOrderValue}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Usage Limit"
                name="usageLimit"
                type="number"
                fullWidth
                value={formData.usageLimit}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Rank Yêu cầu (ID/Level)"
                name="rank"
                type="number"
                fullWidth
                value={formData.rank}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Ngày bắt đầu"
                name="startDate"
                type="date"
                fullWidth
                value={formData.startDate}
                onChange={handleChange}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Ngày kết thúc"
                name="endDate"
                type="date"
                fullWidth
                value={formData.endDate}
                onChange={handleChange}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UpdateRankVoucher;