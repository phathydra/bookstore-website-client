import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';
import './style.css'; // Assuming you have a style.css for custom styles

const UpdateBook = ({ book, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    price: '',
    genre: '',
    year: '',
    publisher: '',
    language: '',
    stock: '',
    supplier: '',
    description: '',
    image: null // Updated to handle file selection
  });

  useEffect(() => {
    setFormData({
      ...book,
      image: null // Reset image to null initially
    });
  }, [book]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value, // If the name is image, handle file selection
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault(); // Prevent default form submission
    onUpdate(formData);
    onClose();
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <Box className="bg-white p-6 rounded-lg w-full max-w-2xl border-2 border-gray-300 shadow-lg">
        <Typography variant="h6" component="h3" className="text-center text-gradient mb-4">
          Cập nhật sách
        </Typography>
        <form onSubmit={handleUpdate}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Tên sách"
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Tác giả"
                name="author"
                fullWidth
                variant="outlined"
                value={formData.author}
                onChange={handleChange}
                className="input-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { fontSize: '14px' } }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Giá"
                name="price"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.price}
                onChange={handleChange}
                className="input-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { fontSize: '14px' } }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined" className="input-field">
                <InputLabel shrink>Thể loại</InputLabel>
                <Select
                  label="Thể loại"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  required
                  style={{ fontSize: '14px' }}
                >
                  <MenuItem value="Fiction">Fiction</MenuItem>
                  <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
                  <MenuItem value="Science Fiction">Science Fiction</MenuItem>
                  <MenuItem value="Fantasy">Fantasy</MenuItem>
                  <MenuItem value="Biography">Biography</MenuItem>
                  <MenuItem value="Mystery">Mystery</MenuItem>
                  <MenuItem value="Romance">Romance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Năm xuất bản"
                name="year"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.year}
                onChange={handleChange}
                className="input-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { fontSize: '14px' } }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Nhà xuất bản"
                name="publisher"
                fullWidth
                variant="outlined"
                value={formData.publisher}
                onChange={handleChange}
                className="input-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { fontSize: '14px' } }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Ngôn ngữ"
                name="language"
                fullWidth
                variant="outlined"
                value={formData.language}
                onChange={handleChange}
                className="input-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { fontSize: '14px' } }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Số lượng tồn kho"
                name="stock"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.stock}
                onChange={handleChange}
                className="input-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { fontSize: '14px' } }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Nhà cung cấp"
                name="supplier"
                fullWidth
                variant="outlined"
                value={formData.supplier}
                onChange={handleChange}
                className="input-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { fontSize: '14px' } }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Mô tả"
                name="description"
                fullWidth
                variant="outlined"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { fontSize: '14px' } }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                className="input-field"
              >
                Chọn hình ảnh
                <input
                  type="file"
                  name="image"
                  hidden
                  onChange={handleChange}
                />
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

export default UpdateBook;
