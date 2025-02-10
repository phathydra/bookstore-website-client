import React, { useState } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import './style.css'; // Assuming you have a style.css for custom styles

const AddInformation = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAdd = () => {
    onAdd(formData);
    onClose();
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box className="bg-white p-8 rounded-lg w-full max-w-md border-2 border-gray-300 shadow-lg">
        <Typography variant="h5" component="h3" className="text-center text-gradient mb-8">
          Thêm thông tin mới
        </Typography>
        <form onSubmit={handleAdd}>
          <div className="relative mb-6">
            <TextField
              label="Tên"
              name="name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="relative mb-6">
            <FormControl fullWidth variant="outlined" className="input-field">
              <InputLabel>Giới tính</InputLabel>
              <Select
                label="Giới tính"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <MenuItem value="Male">Nam</MenuItem>
                <MenuItem value="Female">Nữ</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="relative mb-6">
            <TextField
              label="Email"
              name="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="relative mb-6">
            <TextField
              label="Số điện thoại"
              name="phone"
              fullWidth
              variant="outlined"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="relative mb-6">
            <TextField
              label="Địa chỉ"
              name="address"
              fullWidth
              variant="outlined"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="relative mb-6">
            <TextField
              label="Avatar URL"
              name="avatar"
              fullWidth
              variant="outlined"
              value={formData.avatar}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <Box className="flex justify-end space-x-4 mt-4">
            <Button variant="text" onClick={onClose} className="cancel-button">
              Hủy
            </Button>
            <Button variant="contained" color="primary" onClick={handleAdd} className="submit-button">
              Lưu
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddInformation;
