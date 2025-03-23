import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';
import axios from 'axios';
import './style.css';

const mainCategories = {
  "Văn Học": ["Tiểu thuyết", "Truyện ngắn", "Thơ ca", "Kịch", "Ngụ ngôn"],
  "Giáo Dục & Học Thuật": ["Sách giáo khoa", "Sách tham khảo", "Ngoại ngữ", "Sách khoa học"],
  "Kinh Doanh & Phát Triển Bản Thân": ["Quản trị", "Tài chính", "Khởi nghiệp", "Lãnh đạo", "Kỹ năng sống"],
  "Khoa Học & Công Nghệ": ["Vật lý", "Hóa học", "Sinh học", "Công nghệ", "Lập trình"],
  "Lịch Sử & Địa Lý": ["Lịch sử thế giới", "Lịch sử Việt Nam", "Địa lý"],
  "Tôn Giáo & Triết Học": ["Phật giáo", "Thiên Chúa giáo", "Hồi giáo", "Triết học"],
  "Sách Thiếu Nhi": ["Truyện cổ tích", "Truyện tranh","Truyện chữ", "Sách giáo dục trẻ em"],
  "Văn Hóa & Xã Hội": ["Du lịch", "Nghệ thuật", "Tâm lý - xã hội"],
  "Sức Khỏe & Ẩm Thực": ["Nấu ăn", "Dinh dưỡng", "Thể dục - thể thao"]
};

const publishers = ["NXB Trẻ", "NXB Kim Đồng", "NXB Giáo dục Việt Nam", "NXB Chính trị quốc gia Sự thật", "NXB Tổng hợp Thành phố Hồ Chí Minh", "NXB Phụ nữ Việt Nam", "NXB Hội Nhà văn", "NXB Lao động", "NXB Dân trí", "NXB Văn học", "NXB Khoa học xã hội", "NXB Đại học Quốc gia Hà Nội","NXB Thế Giới"];
const suppliers = ["Nhã Nam", "Alpha Books", "Megabooks", "Kim Đồng", "Kinokuniya Book Stores", "NXB Trẻ", "Đinh Tị", "AZ Việt Nam", "Tân Việt"];

const AddBook = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    bookName: '',
    bookAuthor: '',
    bookPrice: '',
    mainCategory: '',
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

    // Reset `bookCategory` nếu `mainCategory` thay đổi
    if (name === 'mainCategory') {
      setFormData({ ...formData, [name]: value, bookCategory: '' });
    } else {
      setFormData({ ...formData, [name]: files ? files[0] : value });
    }

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
      return data.secure_url || null;
    } catch (error) {
      console.error('Error uploading image:', error);
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

    const bookData = { ...formData, bookImage: imageUrl || '' };

    try {
      await axios.post('http://localhost:8081/api/book', bookData);
      onClose();
      setTimeout(() => window.location.reload(), 500);
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
      if (formRef.current && !formRef.current.contains(event.target) && (!menu || !menu.contains(event.target))) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <Box ref={formRef} className="bg-white p-6 rounded-lg w-full max-w-2xl border-2 border-gray-300 shadow-lg">
        <Typography variant="h4" className="text-center text-gradient" mb={6} style={{ color: '#3f51b5' }}>
          Thêm sách mới
        </Typography>
        <form onSubmit={handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                {/* Chọn Main Category */}
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel shrink>Main Category</InputLabel>
                    <Select
                      name="mainCategory"
                      value={formData.mainCategory}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value=""><em>Chọn danh mục chính</em></MenuItem>
                      {Object.keys(mainCategories).map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Chọn Book Category */}
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel shrink>Book Category</InputLabel>
                    <Select
                      name="bookCategory"
                      value={formData.bookCategory}
                      onChange={handleChange}
                      required
                      disabled={!formData.mainCategory} // Chỉ cho chọn nếu đã chọn mainCategory
                    >
                      <MenuItem value=""><em>Chọn thể loại sách</em></MenuItem>
                      {formData.mainCategory && mainCategories[formData.mainCategory].map((subCategory) => (
                        <MenuItem key={subCategory} value={subCategory}>{subCategory}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Các input khác */}
                {Object.keys(formData).map((key, index) => (
                  key !== 'bookImage' && key !== 'bookCategory' && key !== 'mainCategory' && key !== 'bookPublisher' && key !== 'bookSupplier' && (
                    <Grid item xs={6} key={index}>
                      <TextField
                        label={key}
                        name={key}
                        type={key.includes('Price') || key.includes('Quantity') ? 'number' : 'text'}
                        fullWidth
                        variant="outlined"
                        value={formData[key]}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                  )
                ))}

                {/* Chọn Publisher */}
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel shrink>Publisher</InputLabel>
                    <Select
                      name="bookPublisher"
                      value={formData.bookPublisher}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value=""><em>Chọn nhà xuất bản</em></MenuItem>
                      {
                        publishers.map((publisher) => (
                          <MenuItem key={publisher} value={publisher}>{publisher}</MenuItem>
                        ))
                      }
                      </Select>
                    </FormControl>
                  </Grid>
  
                  {/* Chọn Supplier */}
                  <Grid item xs={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel shrink>Supplier</InputLabel>
                      <Select
                        name="bookSupplier"
                        value={formData.bookSupplier}
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value=""><em>Chọn nhà cung cấp</em></MenuItem>
                        {
                          suppliers.map((supplier) => (
                            <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
                          ))
                        }
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
  
              {/* Upload Hình Ảnh */}
              <Grid item xs={4} style={{ textAlign: 'center' }}>
                <Box style={{ width: '100%', height: '200px', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {imagePreviewUrl ? (
                    <img src={imagePreviewUrl} alt="Book preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Typography variant="body2" color="textSecondary">No image selected</Typography>
                  )}
                </Box>
                <Button variant="contained" component="label" fullWidth>
                  Chọn hình ảnh
                  <input type="file" name="bookImage" hidden onChange={handleChange} />
                </Button>
              </Grid>
            </Grid>
  
            <Box className="flex justify-end space-x-4 mt-4">
              <Button onClick={onClose}>Hủy</Button>
              <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                {isLoading ? 'Đang thêm...' : 'Lưu'}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    );
  };
  
  export default AddBook;