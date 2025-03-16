import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import axios from 'axios';
import './style.css';

const mainCategories = {
  "Văn Học": ["Tiểu thuyết", "Truyện ngắn", "Thơ ca", "Kịch", "Ngụ ngôn"],
  "Giáo Dục & Học Thuật": ["Sách giáo khoa", "Sách tham khảo", "Ngoại ngữ", "Sách khoa học"],
  "Kinh Doanh & Phát Triển Bản Thân": ["Quản trị", "Tài chính", "Khởi nghiệp", "Lãnh đạo", "Kỹ năng sống"],
  "Khoa Học & Công Nghệ": ["Vật lý", "Hóa học", "Sinh học", "Công nghệ", "Lập trình"],
  "Lịch Sử & Địa Lý": ["Lịch sử thế giới", "Lịch sử Việt Nam", "Địa lý"],
  "Tôn Giáo & Triết Học": ["Phật giáo", "Thiên Chúa giáo", "Hồi giáo", "Triết học"],
  "Sách Thiếu Nhi": ["Truyện cổ tích", "Truyện tranh", "Sách giáo dục trẻ em"],
  "Văn Hóa & Xã Hội": ["Du lịch", "Nghệ thuật", "Tâm lý - xã hội"],
  "Sức Khỏe & Ẩm Thực": ["Nấu ăn", "Dinh dưỡng", "Thể dục - thể thao"]
};


const UpdateBook = ({ book, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    bookId: '',
    bookName: '',
    bookAuthor: '',
    bookPrice: '',
    bookYearOfProduction: '',
    bookPublisher: '',
    bookLanguage: '',
    bookStockQuantity: '',
    bookSupplier: '',
    bookDescription: '',
    bookImage: null,
    mainCategory: '',
    bookCategory: ''
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  useEffect(() => {
    if (book) {
      setFormData(book);
      if (book.bookImage) {
        setImagePreviewUrl(book.bookImage);
      }
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mainCategory') {
      setFormData({
        ...formData,
        mainCategory: value,
        bookCategory: '' // Reset bookCategory khi chọn mainCategory mới
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`http://localhost:8081/api/book/${book.bookId}`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      onUpdate(response.data);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <Box className="bg-white p-6 rounded-lg w-full max-w-2xl border-2 border-gray-300 shadow-lg">
        <Typography variant="h6" className="text-center text-gradient mb-4">
          Cập nhật thông tin sách
        </Typography>
        <form onSubmit={handleUpdate}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                {Object.keys(formData).map((key, index) => (
                  key !== 'bookImage' && key !== 'bookId' && key !== 'mainCategory' && key !== 'bookCategory' && (
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
                        required
                      />
                    </Grid>
                  )
                ))}
                {/* Main Category */}
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Main Category</InputLabel>
                    <Select
                      name="mainCategory"
                      value={formData.mainCategory}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {Object.keys(mainCategories).map((category, index) => (
                        <MenuItem key={index} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Book Category (phụ thuộc vào Main Category) */}
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined" disabled={!formData.mainCategory}>
                    <InputLabel>Book Category</InputLabel>
                    <Select
                      name="bookCategory"
                      value={formData.bookCategory}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {formData.mainCategory && mainCategories[formData.mainCategory].map((subcategory, index) => (
                        <MenuItem key={index} value={subcategory}>{subcategory}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Image Upload */}
            <Grid item xs={4} style={{ textAlign: 'center' }}>
              <Box style={{ width: '100%', height: '200px', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Book preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <Typography variant="body2" color="textSecondary">No image selected</Typography>
                )}
              </Box>
              <Button variant="contained" component="label" fullWidth style={{ backgroundColor: '#3f51b5', color: '#fff' }}>
                Chọn hình ảnh
                <input type="file" name="bookImage" hidden onChange={handleChange} />
              </Button>
            </Grid>
          </Grid>

          <Box className="flex justify-end space-x-4 mt-4">
            <Button variant="text" onClick={onClose} className="cancel-button">Hủy</Button>
            <Button variant="contained" color="primary" type="submit" className="submit-button">Cập nhật</Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UpdateBook;
