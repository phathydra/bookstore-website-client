import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const AddDiscount = ({ onClose }) => {
  const [formData, setFormData] = useState({
    percentage: '',
    startDate: '',
    endDate: '',
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
    setIsLoading(true);
    try {
      await axios.post('http://localhost:8081/api/discounts', formData);
      onClose();
      window.location.reload(); // Reload to refresh the list
    } catch (error) {
      console.error('Error adding discount:', error);
      setError('Error adding discount.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box className="bg-white p-6 rounded-lg w-full max-w-md">
        <Typography variant="h6" mb={2}>Add New Discount</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleAdd}>
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
              {isLoading ? 'Adding...' : 'Add'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddDiscount;