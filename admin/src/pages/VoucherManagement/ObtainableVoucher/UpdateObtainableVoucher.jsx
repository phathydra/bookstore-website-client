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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import axios from 'axios';

// 1. Nhận đúng prop 'voucher' và 'onSuccess'
const UpdateObtainableVoucher = ({ voucher, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    voucherType: 'Percentage Discount', // Giá trị mặc định tránh lỗi select
    percentageDiscount: '',
    valueDiscount: '',
    highestDiscountValue: '',
    minOrderValue: '',
    usageLimit: '',
    publicClaimable: false,
    valueRequirement: '',
    startDate: '',
    endDate: '',
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
      console.log("Data loaded into update form:", voucher); // Debug
      setFormData({
        code: voucher.code || '',
        voucherType: voucher.voucherType || 'Percentage Discount',
        percentageDiscount: voucher.percentageDiscount || '',
        valueDiscount: voucher.valueDiscount || '',
        highestDiscountValue: voucher.highestDiscountValue || '',
        minOrderValue: voucher.minOrderValue || '',
        usageLimit: voucher.usageLimit || '',
        publicClaimable: voucher.publicClaimable || false,
        valueRequirement: voucher.valueRequirement || '',
        startDate: formatDateForInput(voucher.startDate),
        endDate: formatDateForInput(voucher.endDate),
      });
    }
  }, [voucher]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Xử lý số và checkbox
    let val = value;
    if (type === 'checkbox') {
        val = checked;
    } else if (['percentageDiscount', 'valueDiscount', 'highestDiscountValue', 'minOrderValue', 'usageLimit', 'valueRequirement'].includes(name)) {
        val = value === '' ? '' : Number(value);
    }
    
    setFormData({ ...formData, [name]: val });
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 3. Gọi API update
      await axios.put(`http://localhost:8082/api/vouchers/obtainable/${voucher.id}`, formData);
      alert("Cập nhật thành công!");
      if (onSuccess) onSuccess(); // Load lại danh sách bên ngoài
      onClose();
    } catch (error) {
      console.error('Error updating obtainable voucher:', error);
      setError('Lỗi khi cập nhật voucher. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Overlay component
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
        <Typography variant="h6" mb={2}>Cập nhật Voucher: {voucher?.code}</Typography>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        
        <form onSubmit={handleUpdate}>
          <Box display="flex" gap={2} flexWrap="wrap">
            {/* Cột Trái */}
            <Box flex={1} minWidth="300px">
              <TextField
                label="Mã Code"
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
                  <MenuItem value="Percentage Discount">Phần trăm giảm</MenuItem>
                  <MenuItem value="Value Discount">Giảm theo tiền</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Phần trăm giảm (%)"
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
                label="Giá trị giảm (VNĐ)"
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
                label="Giảm tối đa (VNĐ)"
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
                label="Đơn tối thiểu (Min Order)"
                name="minOrderValue"
                type="number"
                fullWidth
                value={formData.minOrderValue}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Giới hạn số lượng (Usage Limit)"
                name="usageLimit"
                type="number"
                fullWidth
                value={formData.usageLimit}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    name="publicClaimable"
                    checked={formData.publicClaimable}
                    onChange={handleChange}
                  />
                }
                label="Công khai (Public Claimable)"
                sx={{ mt: 2 }}
              />

              <TextField
                label="Giá trị yêu cầu (Value Req)"
                name="valueRequirement"
                type="number"
                fullWidth
                value={formData.valueRequirement}
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

export default UpdateObtainableVoucher;