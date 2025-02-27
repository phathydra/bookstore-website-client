import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';
import axios from 'axios';
import './style.css';

const AddBook = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    bookName: '',
    bookAuthor: '',
    bookPrice: '',
    bookCategory: '',
    bookYearOfProduction: '',
    bookPublisher: '',
    bookLanguage: '',
    bookStockQuantity: '',
    bookSupplier: '',
    bookDescription: '',
    bookImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'bookImage' && files && files[0]) {
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
    setError('');
  };

  const handleImageUpload = async (file) => {
    if (!file) {
      setError('No file selected for upload.');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Upload_image');
    formData.append('cloud_name', 'dfsxqmwkz');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dfsxqmwkz/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        setError('Failed to upload image to Cloudinary.');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      setError('Error uploading image.');
      return null;
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    let imageUrl = formData.bookImage;
    if (formData.bookImage instanceof File) {
      imageUrl = await handleImageUpload(formData.bookImage);
      if (!imageUrl) return;
    }
  
    const bookData = {
      ...formData,
      bookImage: imageUrl || '',
    };
  
    try {
      await axios.post('http://localhost:8081/api/book', bookData);
      onClose(); // Đóng form sau khi thêm thành công
      setTimeout(() => {
        window.location.reload(); // Load lại trang sau khi đóng form
      }, 500);
    } catch (error) {
      console.error('Error adding book:', error);
      setError('Error adding book.');
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.querySelector('.MuiMenu-paper');
      if (
        formRef.current &&
        !formRef.current.contains(event.target) &&
        (!menu || !menu.contains(event.target))
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <Box ref={formRef} className="bg-white p-6 rounded-lg w-full max-w-2xl border-2 border-gray-300 shadow-lg">
        <Typography variant="h4" component="h3" className="text-center text-gradient" mb={6} style={{ color: '#3f51b5' }}>
          Thêm sách mới
        </Typography>
        <form onSubmit={handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                {Object.keys(formData).map((key, index) => (
                  key !== 'bookImage' && key !== 'bookCategory' && (
                    <Grid item xs={6} key={index}>
                      <TextField
                        label={key}
                        name={key}
                        type={key.includes('Price') || key.includes('Quantity') ? 'number' : 'text'}
                        fullWidth
                        variant="outlined"
                        value={formData[key]}
                        onChange={handleChange}
                        className="input-field"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          style: { fontSize: '14px' },
                          sx: key === 'bookPrice' || key === 'bookStockQuantity' ? { height: '46px' } : {},
                        }}
                        sx={{
                          width: key === 'bookPrice' || key === 'bookStockQuantity' ? '120px' : '100%',
                        }}
                        required
                      />
                    </Grid>
                  )
                ))}
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined" className="input-field" style={{ width: '100%', height: '58px' }}>
                    <InputLabel shrink>Book Category</InputLabel>
                    <Select
                      name="bookCategory"
                      value={formData.bookCategory}
                      onChange={handleChange}
                      displayEmpty
                      required
                      style={{ fontSize: '14px', height: '45px', display: 'flex', alignItems: 'center' }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="Tiểu thuyết">Tiểu thuyết</MenuItem>
                      <MenuItem value="Phi hư cấu">Phi hư cấu</MenuItem>
                      <MenuItem value="Khoa học">Khoa học</MenuItem>
                      <MenuItem value="Lịch sử">Lịch sử</MenuItem>
                      <MenuItem value="Tâm lý">Tâm lý</MenuItem>
                      <MenuItem value="Kinh doanh">Kinh doanh</MenuItem>
                      <MenuItem value="Giáo dục">Giáo dục</MenuItem>
                      <MenuItem value="Thiếu nhi">Thiếu nhi</MenuItem>
                      <MenuItem value="Nghệ thuật">Nghệ thuật</MenuItem>
                      <MenuItem value="Trinh thám">Trinh thám</MenuItem>
                      <MenuItem value="Kinh dị">Kinh dị</MenuItem>
                      <MenuItem value="Khoa học viễn tưởng">Khoa học viễn tưởng</MenuItem>
                      <MenuItem value="Thể thao">Thể thao</MenuItem>
                      <MenuItem value="Ẩm thực">Ẩm thực</MenuItem>
                    </Select>
                  </FormControl>
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
                    alt="Book preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">No image selected</Typography>
                )}
              </Box>
              <Button variant="contained" component="label" fullWidth className="input-field" style={{ backgroundColor: '#3f51b5', color: '#fff' }}>
                Chọn hình ảnh
                <input type="file" name="bookImage" hidden onChange={handleChange} />
              </Button>
            </Grid>
          </Grid>
          <Box className="flex justify-end space-x-4 mt-4">
            <Button variant="text" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="contained" color="primary" type="submit" disabled={isLoading} style={{ backgroundColor: '#3f51b5', color: '#fff' }}>
              {isLoading ? 'Đang thêm...' : 'Lưu'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddBook;
