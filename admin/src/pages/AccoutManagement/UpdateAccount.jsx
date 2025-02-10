import React, { useState } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import './style.css'; // Assuming you have a style.css for custom styles

const UpdateAccount = ({ account, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    username: account?.username || '',
    email: account?.email || '',
    role: account?.role || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdate = () => {
    onUpdate(formData);
    onClose();
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <Box className="bg-white p-8 rounded-lg w-full max-w-md border-2 border-gray-300 shadow-lg">
        <Typography variant="h5" component="h3" className="text-center text-gradient mb-8">
          Cập nhật tài khoản
        </Typography>
        <form onSubmit={handleUpdate}>
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
            <Button variant="contained" color="primary" onClick={handleUpdate} className="submit-button">
              Lưu
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UpdateAccount;
