import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Checkbox
} from '@mui/material';
import axios from 'axios';

// 1. Sửa props nhận vào thành 'voucher' và thêm 'onSuccess'
const UpdateVoucher = ({ voucher, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    voucherType: 'Percentage Discount',
    percentageDiscount: '',
    valueDiscount: '',
    highestDiscountValue: '',
    minOrderValue: '',
    usageLimit: '',
    userUsageLimit: '',
    startDate: '',
    endDate: '',
    publish: false,
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
    // 2. Sử dụng biến 'voucher'
    if (voucher) {
      console.log("Loading voucher data:", voucher);
      setFormData({
        code: voucher.code || '',
        voucherType: voucher.voucherType || 'Percentage Discount',
        percentageDiscount: voucher.percentageDiscount || '',
        valueDiscount: voucher.valueDiscount || '',
        highestDiscountValue: voucher.highestDiscountValue || '',
        minOrderValue: voucher.minOrderValue || '',
        usageLimit: voucher.usageLimit || '',
        userUsageLimit: voucher.userUsageLimit || '',
        startDate: formatDateForInput(voucher.startDate),
        endDate: formatDateForInput(voucher.endDate),
        publish: voucher.publish || false,
      });
    }
  }, [voucher]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Logic ép kiểu số nếu cần
    let val = value;
    if (type === 'checkbox') {
        val = checked;
    } else if (name.includes("Discount") || name.includes("Value") || name.includes("Limit")) {
        val = value === '' ? '' : Number(value);
    }

    setFormData({ ...formData, [name]: val });
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Gọi API update
      await axios.put(`http://localhost:8082/api/vouchers/${voucher.id}`, formData);
      alert("Cập nhật thành công!");
      if (onSuccess) onSuccess(); // Reload danh sách
      onClose();
    } catch (error) {
      console.error('Error updating voucher:', error);
      setError(error.response?.data?.message || 'Cập nhật voucher thất bại.');
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
      <Box className="bg-white p-6 rounded-lg w-full max-w-3xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <Typography variant="h6" mb={2}>Cập nhật Voucher</Typography>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        
        <form onSubmit={handleUpdate}>
          <Box display="flex" gap={2} flexWrap="wrap">
            {/* Cột Trái */}
            <Box flex={1} minWidth="300px">
              <TextField 
                label="Mã Voucher" name="code" fullWidth 
                value={formData.code} onChange={handleChange}
                required margin="normal" 
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="voucher-type-label">Loại Voucher</InputLabel>
                <Select 
                    labelId="voucher-type-label" name="voucherType" 
                    value={formData.voucherType} onChange={handleChange} required
                    label="Loại Voucher"
                >
                  <MenuItem value="Percentage Discount">Giảm theo %</MenuItem>
                  <MenuItem value="Value Discount">Giảm giá trị cố định</MenuItem>
                </Select>
              </FormControl>
              <TextField 
                label="Phần trăm giảm" name="percentageDiscount" type="number" fullWidth
                value={formData.percentageDiscount} onChange={handleChange} margin="normal"
                disabled={formData.voucherType !== "Percentage Discount"} 
                InputLabelProps={{ shrink: true }}
              />
              <TextField 
                label="Giá trị giảm" name="valueDiscount" type="number" fullWidth
                value={formData.valueDiscount} onChange={handleChange} margin="normal"
                disabled={formData.voucherType !== "Value Discount"} 
                InputLabelProps={{ shrink: true }}
              />
              <TextField 
                label="Giảm tối đa" name="highestDiscountValue" type="number" fullWidth
                value={formData.highestDiscountValue} onChange={handleChange} margin="normal" 
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Cột Phải */}
            <Box flex={1} minWidth="300px">
              <TextField 
                label="Giá trị đơn tối thiểu" name="minOrderValue" type="number" fullWidth
                value={formData.minOrderValue} onChange={handleChange} margin="normal" 
                InputLabelProps={{ shrink: true }}
              />
              <TextField 
                label="Giới hạn sử dụng (Tổng)" name="usageLimit" type="number" fullWidth
                value={formData.usageLimit} onChange={handleChange} margin="normal" 
                InputLabelProps={{ shrink: true }}
              />
              <TextField 
                label="Giới hạn mỗi người" name="userUsageLimit" type="number" fullWidth
                value={formData.userUsageLimit} onChange={handleChange} margin="normal" 
                InputLabelProps={{ shrink: true }}
              />
              <TextField 
                label="Ngày bắt đầu" name="startDate" type="date" fullWidth
                value={formData.startDate} onChange={handleChange} required margin="normal"
                InputLabelProps={{ shrink: true }} 
              />
              <TextField 
                label="Ngày kết thúc" name="endDate" type="date" fullWidth
                value={formData.endDate} onChange={handleChange} required margin="normal"
                InputLabelProps={{ shrink: true }} 
              />
              <FormControlLabel 
                control={<Checkbox name="publish" checked={formData.publish} onChange={handleChange} />}
                label="Công khai" sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={onClose} disabled={isLoading}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Cập nhật'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UpdateVoucher;