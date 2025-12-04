import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import axios from 'axios';

const AddRankVoucher = ({ onClose }) => {
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
    rank: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name.includes("Discount") || name.includes("Value") || name === "usageLimit" || name === "rank" ? Number(value) || '' : value;
    setFormData({
      ...formData,
      [name]: parsedValue,
    });
    setError('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:8082/api/vouchers/rank', formData);
      onClose();
    } catch (error) {
      console.error('Error adding rank voucher:', error);
      setError('Error adding rank voucher.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box
        className="bg-white p-6 rounded-lg w-full max-w-3xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <Typography variant="h6" mb={2}>Add New Rank Voucher</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
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
            </Grid>

            <Grid item xs={12} sm={6}>
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
                label="Rank"
                name="rank"
                type="number"
                fullWidth
                value={formData.rank}
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
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddRankVoucher;