import React, { useState } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import './style.css';

const AddAccount = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    try {
      console.log('FormData:', formData);
      
      const response = await axios.post('http://localhost:8080/api/account/create', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (onAdd) {
        onAdd();  // Gọi lại API để cập nhật danh sách
      }
      
      onClose(); // Đóng form sau khi thêm thành công
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };
  
  

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box className="bg-white p-8 rounded-lg w-full max-w-md border-2 border-gray-300 shadow-lg">
        <Typography variant="h5" component="h3" className="text-center text-gradient mb-8">
          Thêm tài khoản mới
        </Typography>
        <form onSubmit={handleAdd}>
          <div className="relative mb-6">
            <TextField
              label="Tên"
              name="username"
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="relative mb-6">
            <TextField
              label="Mật khẩu"
              name="password"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="relative mb-6">
            <FormControl fullWidth variant="outlined" className="input-field">
              <InputLabel>Quyền</InputLabel>
              <Select
                label="Quyền"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
              </Select>
            </FormControl>
          </div>
          <Box className="flex justify-end space-x-4 mt-4">
            <Button variant="text" onClick={onClose} className="cancel-button">
              Hủy
            </Button>
            <Button variant="contained" color="primary" type="submit" className="submit-button">
              Lưu
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddAccount;
