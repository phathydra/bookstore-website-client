import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button,
  TextField, Box, Grid, Select, MenuItem, FormControl,
  InputLabel, Autocomplete, CircularProgress, Typography,
  List, ListItem, ListItemAvatar, Avatar, ListItemText,
  Snackbar, Alert // <--- 1. Thêm import Snackbar và Alert
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getAllBookDetails, createCombo, updateCombo } from '../services/comboService';

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

const ComboForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bookIds: [], 
    discountType: 'PERCENT',
    discountValue: 0,
    startDate: '',
    endDate: '',
    image: '' 
  });

  const [allBooks, setAllBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);

  // --- 2. State cho thông báo thành công ---
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    setLoadingBooks(true);
    getAllBookDetails()
      .then(response => {
        const mappedBooks = response.data.map(b => ({
          ...b,
          bookId: b.bookId || b.id, 
          bookName: b.bookName || b.name
        }));
        setAllBooks(mappedBooks);
      })
      .catch(err => console.error("Lỗi tải sách:", err))
      .finally(() => setLoadingBooks(false));
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        bookIds: initialData.bookIds || [],
        discountType: initialData.discountType,
        discountValue: initialData.discountValue,
        startDate: formatDateForInput(initialData.startDate),
        endDate: formatDateForInput(initialData.endDate),
        image: initialData.image || ''
      });
    }
  }, [initialData, isEditMode]);

  useEffect(() => {
    if (allBooks.length > 0) {
      const selectedObjects = allBooks.filter(book =>
        formData.bookIds.includes(book.bookId)
      );
      setSelectedBooks(selectedObjects);
    }
  }, [formData.bookIds, allBooks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookChange = (event, newValue) => {
    setSelectedBooks(newValue);
    setFormData(prev => ({
      ...prev,
      bookIds: newValue.map(book => book.bookId)
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const dataInfo = new FormData();
    dataInfo.append("file", file);
    dataInfo.append("upload_preset", "Upload_image");
    dataInfo.append("cloud_name", "dfsxqmwkz");

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dfsxqmwkz/image/upload", {
            method: "POST",
            body: dataInfo,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        setFormData(prev => ({ ...prev, image: data.secure_url }));
        
    } catch (error) {
        console.error("Error uploading image:", error);
        setError("Lỗi upload ảnh: " + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return; 

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        await updateCombo(initialData.comboId, formData);
        setSuccessMessage("Cập nhật combo thành công!"); // Set thông báo sửa
      } else {
        await createCombo(formData);
        setSuccessMessage("Tạo combo mới thành công!"); // Set thông báo tạo
      }
      
      // --- 3. Hiện thông báo và đợi 1.5s mới đóng form ---
      setShowSuccess(true);
      setTimeout(() => {
        onSave(); // Refresh lại list ở component cha
        onClose(); // Đóng dialog
      }, 1500);

    } catch (err) {
      console.error("Lỗi lưu combo:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lưu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={true} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{isEditMode ? 'Cập Nhật Combo' : 'Tạo Combo Mới'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* KHUNG UPLOAD ẢNH */}
              <Grid item xs={12} display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Box 
                    sx={{ 
                      width: '100%', height: 200, 
                      border: '2px dashed #ccc', borderRadius: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: '#f9f9f9', position: 'relative', overflow: 'hidden'
                    }}
                  >
                    {isUploading ? (
                        <CircularProgress />
                    ) : formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <Button 
                          color="error" variant="contained" size="small" 
                          sx={{ position: 'absolute', top: 5, right: 5 }}
                          onClick={handleRemoveImage}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </>
                    ) : (
                      <Typography color="text.secondary">Chưa có ảnh mô tả</Typography>
                    )}
                  </Box>
                  
                  <Button 
                      component="label" 
                      variant="contained" 
                      startIcon={<CloudUploadIcon />}
                      disabled={isUploading}
                  >
                    {isUploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField name="name" label="Tên Combo" value={formData.name} onChange={handleChange} fullWidth required />
              </Grid>
              
              <Grid item xs={12}>
                <TextField name="description" label="Mô tả" value={formData.description} onChange={handleChange} fullWidth multiline rows={2} />
              </Grid>

              {/* Phần chọn Sách */}
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="book-ids"
                  options={allBooks}
                  getOptionLabel={(option) => option.bookName}
                  value={selectedBooks}
                  onChange={handleBookChange}
                  loading={loadingBooks}
                  isOptionEqualToValue={(option, value) => option.bookId === value.bookId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chọn sách áp dụng"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingBooks ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* List sách đã chọn */}
              <Grid item xs={12}>
                {selectedBooks.length > 0 && (
                  <Box sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: 1, maxHeight: 100, overflowY: 'auto' }}>
                    <List dense>
                      {selectedBooks.map((book) => ( 
                        <ListItem key={book.bookId}>
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar variant="rounded" src={book.bookImages?.[0] || ''} sx={{ width: 32, height: 40 }} />
                          </ListItemAvatar>
                          <ListItemText primary={book.bookName} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại Giảm Giá</InputLabel>
                  <Select name="discountType" value={formData.discountType} label="Loại Giảm Giá" onChange={handleChange}>
                    <MenuItem value="PERCENT">Phần trăm (%)</MenuItem>
                    <MenuItem value="FIXED_AMOUNT">Số tiền cố định (VND)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField name="discountValue" label="Giá Trị Giảm" type="number" value={formData.discountValue} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={6}>
                <TextField name="startDate" label="Ngày Bắt Đầu" type="date" value={formData.startDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField name="endDate" label="Ngày Kết Thúc" type="date" value={formData.endDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
            
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="secondary">Hủy</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={isSubmitting || isUploading} 
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Combo'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* --- 4. Component Snackbar thông báo thành công --- */}
      <Snackbar 
        open={showSuccess} 
        autoHideDuration={2000} 
        onClose={() => {}}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ComboForm;