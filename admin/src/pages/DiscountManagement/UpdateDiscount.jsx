import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const UpdateDiscount = ({ selectedDiscount, onClose }) => {
  const [formData, setFormData] = useState({
    percentage: '',
    startDate: '',
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedDiscount) {
      setFormData({
        percentage: selectedDiscount.percentage,
        startDate: new Date(selectedDiscount.startDate).toISOString().split('T')[0],
        endDate: new Date(selectedDiscount.endDate).toISOString().split('T')[0],
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
    setIsLoading(true);
    try {
      await axios.put(`http://localhost:8081/api/discounts/${selectedDiscount.id}`, formData);
      onClose();
      window.location.reload(); // Reload to refresh the list
    } catch (error) {
      console.error('Error updating discount:', error);
      setError('Error updating discount.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box className="bg-white p-6 rounded-lg w-full max-w-md">
        <Typography variant="h6" mb={2}>Update Discount</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleUpdate}>
          <TextField
            label="Percentage"
            name="percentage"
            type="number"
            fullWidth
            value={formData.percentage}
            onChange={handleChange}
            required
            margin="normal"
            inputProps={{ min: 0, max: 100 }}
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

export default UpdateDiscount;