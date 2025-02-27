import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Grid } from '@mui/material';
import axios from 'axios';
import './style.css';

const UpdateInformation = ({ information, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    id: '',
    accountId: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: null,
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  useEffect(() => {
    if (information) {
      setFormData({
        id: information.id,
        accountId: information.accountId,
        name: information.name,
        email: information.email,
        phone: information.phone,
        address: information.address,
        avatar: null,
      });
      if (information.avatar) {
        setImagePreviewUrl(information.avatar);
      }
    }
  }, [information]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;

    const imageData = new FormData();
    imageData.append('file', file);
    imageData.append('upload_preset', 'Upload_image');
    imageData.append('cloud_name', 'dfsxqmwkz');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dfsxqmwkz/image/upload', {
        method: 'POST',
        body: imageData,
      });
      const data = await response.json();
      return data.secure_url || null;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return null;
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
  
    let imageUrl = formData.avatar;
    if (formData.avatar instanceof File) {
      imageUrl = await handleImageUpload(formData.avatar);
      if (!imageUrl) return;
    }
  
    const updatedData = { ...formData, avatar: imageUrl || '' };
  
    try {
      const response = await axios.put(`http://localhost:8080/api/account/update-information?accountId=${formData.accountId}`, updatedData, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      onUpdate(response.data); // Cập nhật dữ liệu mới
      onClose(); // Đóng form cập nhật
      window.location.reload(); // Reload lại trang sau khi cập nhật thành công
    } catch (error) {
      console.error('Error updating information:', error);
    }
  };
  

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <Box className="bg-white p-6 rounded-lg w-full max-w-2xl border-2 border-gray-300 shadow-lg">
        <Box className="flex justify-center items-center mb-4">
          <Typography variant="h6" component="h3" className="text-center text-gradient" style={{ marginRight: '10px' }}>
            Cập nhật thông tin
          </Typography>
        </Box>
        <form onSubmit={handleUpdate}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Id"
                    name="id"
                    fullWidth
                    variant="outlined"
                    value={formData.id}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Account Id"
                    name="accountId"
                    fullWidth
                    variant="outlined"
                    value={formData.accountId}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
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
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4} className="image-preview-container" style={{ textAlign: 'center' }}>
              <Box 
                style={{
                  width: '100%',
                  height: '200px',
                  border: '1px solid #ccc',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}
              >
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Avatar preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">No image selected</Typography>
                )}
              </Box>
              <Button variant="contained" component="label" fullWidth className="input-field" style={{ backgroundColor: '#3f51b5', color: '#fff' }}>
                Chọn hình ảnh
                <input type="file" name="avatar" hidden onChange={handleChange} />
              </Button>
            </Grid>
          </Grid>
          <Box className="flex justify-end space-x-4 mt-4">
            <Button variant="text" onClick={onClose} className="cancel-button">
              Hủy
            </Button>
            <Button variant="contained" color="primary" type="submit" className="submit-button">
              Cập nhật
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UpdateInformation;
