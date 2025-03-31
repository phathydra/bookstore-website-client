import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const UpdateVoucher = ({ selectedVoucher, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    voucherType: '',
    percentageDiscount: '',
    valueDiscount: '',
    highestDiscountValue: '',
    minOrderValue: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedVoucher) {
      setFormData({
        code: selectedVoucher.code,
        voucherType: selectedVoucher.voucherType,
        percentageDiscount: selectedVoucher.percentageDiscount,
        valueDiscount: selectedVoucher.valueDiscount,
        highestDiscountValue: selectedVoucher.highestDiscountValue,
        minOrderValue: selectedVoucher.minOrderValue,
        usageLimit: selectedVoucher.usageLimit,
        startDate: new Date(selectedVoucher.startDate).toISOString().split('T')[0],
        endDate: new Date(selectedVoucher.endDate).toISOString().split('T')[0],
      });
    }
  }, [selectedVoucher]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes("Discount") || name.includes("Value") || name.includes("Limit") 
        ? Number(value) || '' 
        : value,
    });
    setError("");
  };
  

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`http://localhost:8082/api/vouchers/${selectedVoucher.id}`, formData);
      onSuccess(); // Refresh the voucher list
      onClose();
    } catch (error) {
      console.error('Error updating voucher:', error);
      setError('Error updating voucher.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box
        className="bg-white p-6 rounded-lg w-full max-w-md"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <Typography variant="h6" mb={2}>Update Voucher</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleUpdate}>
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
            <InputLabel id="voucher-type-label">Voucher Type</InputLabel>
            <Select
              labelId="voucher-type-label"
              name="voucherType"
              value={formData.voucherType}
              onChange={handleChange}
              required
            >
              <MenuItem value="Percentage Discount">Percentage Discount</MenuItem>
              <MenuItem value="Value Discount">Value Discount</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Percentage Discount"
            name="percentageDiscount"
            type="number"
            fullWidth
            value={formData.percentageDiscount}
            onChange={handleChange}
            margin="normal"
            disabled={formData.voucherType !== "Percentage Discount"}
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
          />
          <TextField
            label="Highest Discount Value"
            name="highestDiscountValue"
            type="number"
            fullWidth
            value={formData.highestDiscountValue}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Min Order Value"
            name="minOrderValue"
            type="number"
            fullWidth
            value={formData.minOrderValue}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Usage Limit"
            name="usageLimit"
            type="number"
            fullWidth
            value={formData.usageLimit}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Start Date"
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
            label="End Date"
            name="endDate"
            type="date"
            fullWidth
            value={formData.endDate}
            onChange={handleChange}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UpdateVoucher;