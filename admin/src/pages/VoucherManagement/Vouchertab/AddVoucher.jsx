import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, FormControlLabel, Checkbox
} from '@mui/material';
import axios from 'axios';

const AddVoucher = ({ onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    voucherType: '',
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const parsedValue = name.includes("Discount") || name.includes("Value") || name.includes("Limit")
      ? Number(value) || ''
      : value;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : parsedValue,
    });
    setError('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:8082/api/vouchers', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      onClose();
    } catch (error) {
      console.error('Error adding voucher:', error);
      setError(error.response?.data?.message || 'Thêm voucher thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box className="bg-white p-6 rounded-lg w-full max-w-3xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <Typography variant="h6" mb={2}>Thêm Voucher Mới</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Mã Voucher" name="code" fullWidth value={formData.code} onChange={handleChange}
                         required margin="normal" />
              <FormControl fullWidth margin="normal">
                <InputLabel id="voucher-type-label">Loại Voucher</InputLabel>
                <Select labelId="voucher-type-label" name="voucherType" value={formData.voucherType} onChange={handleChange} required>
                  <MenuItem value="Percentage Discount">Giảm theo %</MenuItem>
                  <MenuItem value="Value Discount">Giảm giá trị cố định</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Phần trăm giảm" name="percentageDiscount" type="number" fullWidth
                         value={formData.percentageDiscount} onChange={handleChange} margin="normal"
                         disabled={formData.voucherType !== "Percentage Discount"} />
              <TextField label="Giá trị giảm" name="valueDiscount" type="number" fullWidth
                         value={formData.valueDiscount} onChange={handleChange} margin="normal"
                         disabled={formData.voucherType !== "Value Discount"} />
              <TextField label="Giảm tối đa" name="highestDiscountValue" type="number" fullWidth
                         value={formData.highestDiscountValue} onChange={handleChange} margin="normal" />
              <TextField label="Giá trị đơn tối thiểu" name="minOrderValue" type="number" fullWidth
                         value={formData.minOrderValue} onChange={handleChange} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Giới hạn sử dụng" name="usageLimit" type="number" fullWidth
                         value={formData.usageLimit} onChange={handleChange} margin="normal" />
              <TextField label=" busty limit/người dùng" name="userUsageLimit" type="number" fullWidth
                         value={formData.userUsageLimit} onChange={handleChange} margin="normal" />
              <TextField label="Ngày bắt đầu" name="startDate" type="date" fullWidth
                         value={formData.startDate} onChange={handleChange} required margin="normal"
                         InputLabelProps={{ shrink: true }} />
              <TextField label="Ngày kết thúc" name="endDate" type="date" fullWidth
                         value={formData.endDate} onChange={handleChange} required margin="normal"
                         InputLabelProps={{ shrink: true }} />
              <FormControlLabel control={<Checkbox name="publish" checked={formData.publish} onChange={handleChange} />}
                                label="Công khai" />
            </Grid>
          </Grid>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} disabled={isLoading}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Đang thêm...' : 'Thêm'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddVoucher;