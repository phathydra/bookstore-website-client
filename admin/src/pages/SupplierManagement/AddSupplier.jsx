import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import './style.css'; // Assuming you have a style.css for custom styles

const AddSupplier = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAdd = (e) => {
    e.preventDefault(); // Prevent default form submission
    onAdd(formData);
    onClose();
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <Box className="bg-white p-6 rounded-lg w-full max-w-md border-2 border-gray-300 shadow-lg">
        <Typography variant="h6" component="h3" className="text-center text-gradient mb-4">
          Add New Supplier
        </Typography>
        <form onSubmit={handleAdd}>
          <div className="relative mb-4">
            <TextField
              label="Supplier Name"
              name="name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              InputLabelProps={{ shrink: true }}
              InputProps={{ style: { fontSize: '14px' } }}
              required
            />
          </div>
          <div className="relative mb-4">
            <TextField
              label="Email"
              name="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              InputLabelProps={{ shrink: true }}
              InputProps={{ style: { fontSize: '14px' } }}
              required
            />
          </div>
          <div className="relative mb-4">
            <TextField
              label="Address"
              name="address"
              fullWidth
              variant="outlined"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              InputLabelProps={{ shrink: true }}
              InputProps={{ style: { fontSize: '14px' } }}
              required
            />
          </div>
          <Box className="flex justify-end space-x-4 mt-4">
            <Button variant="text" onClick={onClose} className="cancel-button">
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit" className="submit-button">
              Save
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddSupplier;
