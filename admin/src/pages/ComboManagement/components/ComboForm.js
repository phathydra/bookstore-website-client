import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button,
  TextField, Box, Grid, Select, MenuItem, FormControl,
  InputLabel, Autocomplete, CircularProgress, Typography,
  List, ListItem, ListItemAvatar, Avatar, ListItemText
} from '@mui/material';
import { getAllBookDetails, createCombo, updateCombo } from '../services/comboService';

// Helper function (giữ nguyên)
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
  });

  const [allBooks, setAllBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // State riêng để quản lý value của Autocomplete
  const [selectedBooks, setSelectedBooks] = useState([]);

  const isEditMode = Boolean(initialData);

  // 1. Tải danh sách tất cả sách (ĐÃ SỬA)
  useEffect(() => {
    setLoadingBooks(true);
    getAllBookDetails()
      .then(response => {
        // === (SỬA LỖI TẠI ĐÂY) ===
        // Thêm logic map dữ liệu để đảm bảo 'bookId' và 'bookName' tồn tại
        const mappedBooks = response.data.map(b => ({
          ...b, // Giữ lại các trường khác như bookImages
          bookId: b.bookId || b.id, 
          bookName: b.bookName || b.name
        }));
        setAllBooks(mappedBooks); // Set dữ liệu đã được chuẩn hóa
      })
      .catch(err => {
        console.error("Lỗi khi tải danh sách sách:", err);
        setError("Không thể tải danh sách sách.");
      })
      .finally(() => {
        setLoadingBooks(false);
      });
  }, []); // Chỉ chạy 1 lần khi mount

  // 2. Nếu là "Edit Mode", điền dữ liệu (giữ nguyên)
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
      });
    }
  }, [initialData, isEditMode]);

  // 3. Đồng bộ 'selectedBooks' (state của Autocomplete)
  //    với 'formData.bookIds' (state của form)
  useEffect(() => {
    if (allBooks.length > 0) {
      // Tìm các object sách đầy đủ dựa trên mảng ID
      const selectedObjects = allBooks.filter(book =>
        formData.bookIds.includes(book.bookId)
      );
      setSelectedBooks(selectedObjects);
    } else {
      setSelectedBooks([]);
    }
  }, [formData.bookIds, allBooks]); // Chạy khi ID thay đổi hoặc khi list sách tải xong

  // Xử lý thay đổi input thông thường
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý thay đổi của Autocomplete (chọn sách)
  const handleBookChange = (event, newValue) => {
    setSelectedBooks(newValue); // Cập nhật state object
    setFormData(prev => ({
      ...prev,
      bookIds: newValue.map(book => book.bookId) // Cập nhật state ID
    }));
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const dataToSend = { ...formData };

    try {
      if (isEditMode) {
        await updateCombo(initialData.comboId, dataToSend);
      } else {
        await createCombo(dataToSend);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Lỗi khi lưu combo:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lưu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditMode ? 'Cập Nhật Combo' : 'Tạo Combo Mới'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Tên Combo */}
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Tên Combo"
                value={formData.name}
                onChange={handleChange}
                fullWidth required
              />
            </Grid>
            {/* Mô tả */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Mô tả"
                value={formData.description}
                onChange={handleChange}
                fullWidth multiline rows={2}
              />
            </Grid>

            {/* Ô CHỌN SÁCH */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                id="book-ids"
                options={allBooks} // Dùng list sách đã chuẩn hóa
                getOptionLabel={(option) => option.bookName} // Đã đảm bảo 'bookName' tồn tại
                
                value={selectedBooks} // Dùng state 'selectedBooks'

                onChange={handleBookChange}
                loading={loadingBooks}
                // 'bookId' đã được đảm bảo tồn tại, không cần '?'
                isOptionEqualToValue={(option, value) => option.bookId === value.bookId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn sách áp dụng"
                    placeholder="Tìm sách..."
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

            {/* DANH SÁCH SÁCH ĐÃ CHỌN */}
            <Grid item xs={12}>
              {selectedBooks.length > 0 && (
                <Box sx={{
                  mt: 1, p: 1, border: '1px solid #ddd',
                  borderRadius: 1, maxHeight: 180, overflowY: 'auto'
                }}>
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    {selectedBooks.length} sách đã chọn:
                  </Typography>
                  <List dense>
                    {selectedBooks.map((book) => ( 
                      <ListItem key={book.bookId}>
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar
                            variant="rounded"
                            src={book.bookImages?.[0] || 'https://via.placeholder.com/60x80.png?text=Book'}
                            alt={book.bookName}
                            sx={{ width: 32, height: 40 }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={book.bookName}
                          primaryTypographyProps={{ fontSize: '14px' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>

            {/* Loại giảm giá */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Loại Giảm Giá</InputLabel>
                <Select
                  name="discountType"
                  value={formData.discountType}
                  label="Loại Giảm Giá"
                  onChange={handleChange}
                >
                  <MenuItem value="PERCENT">Phần trăm (%)</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Số tiền cố định (VND)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Giá trị giảm */}
            <Grid item xs={6}>
              <TextField
                name="discountValue"
                label="Giá Trị Giảm"
                type="number"
                value={formData.discountValue}
                onChange={handleChange}
                fullWidth required
              />
            </Grid>
            {/* Ngày bắt đầu */}
            <Grid item xs={6}>
              <TextField
                name="startDate"
                label="Ngày Bắt Đầu"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {/* Ngày kết thúc */}
            <Grid item xs={6}>
              <TextField
                name="endDate"
                label="Ngày Kết Thúc"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">Hủy</Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu Combo'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ComboForm;