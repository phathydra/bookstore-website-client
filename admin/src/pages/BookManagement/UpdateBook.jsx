import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import axios from 'axios';
import './style.css';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dfsxqmwkz/image/upload';
const UPLOAD_PRESET = 'Upload_image';

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
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    if (book) {
      setFormData(book);
      if (book.bookImage) {
        setImagePreviewUrl(book.bookImage);
      }
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'bookImage' && files && files[0]) {
      setFormData((prev) => ({ ...prev, bookImage: files[0] }));
      setImagePreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      setIsUploading(true);
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let imageUrl = formData.bookImage;
  
    if (formData.bookImage instanceof File) {
      imageUrl = await uploadImageToCloudinary(formData.bookImage);
      if (!imageUrl) {
        setIsUploading(false);
        return;
      }
    }
  
    const updatedBook = { ...formData, bookImage: imageUrl };
  
    try {
      const response = await axios.put(`http://localhost:8081/api/book/${book.bookId}`, updatedBook, {
        headers: { 'Content-Type': 'application/json' },
      });
      onUpdate(response.data);
      onClose();
      window.location.reload(); // Tải lại trang sau khi cập nhật thành công
    } catch (error) {
      console.error('Error updating book:', error);
    } finally {
      setIsUploading(false);
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
                {Object.keys(formData).map((key) => (
                  key !== 'bookImage' && key !== 'bookId' && (
                    <Grid item xs={6} key={key}>
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
              </Grid>
            </Grid>
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
            <Button variant="contained" color="primary" type="submit" className="submit-button" disabled={isUploading}>
              {isUploading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UpdateBook;