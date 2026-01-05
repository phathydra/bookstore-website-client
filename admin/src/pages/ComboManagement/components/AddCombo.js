import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Autocomplete, Chip, 
  Snackbar, Alert // 1. Import thêm Snackbar và Alert
} from '@mui/material';
import { createCombo, getAllBookDetails } from '../services/comboService';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  maxHeight: '90vh',
  overflowY: 'auto'
};

const AddCombo = ({ handleAddCombo, onClose }) => {
  const [comboData, setComboData] = useState({
    name: '',
    description: '',
    bookIds: [],
    discountType: 'FIXED_AMOUNT',
    discountValue: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const [allBooks, setAllBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);

  // 2. State cho thông báo thành công
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state để disable nút khi đang gửi

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await getAllBookDetails();
        const books = response.data.map(b => ({
          bookId: b.bookId || b.id,
          bookName: b.bookName || b.name
        }));
        setAllBooks(books);
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };
    fetchBooks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComboData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookChange = (event, newValue) => {
    setSelectedBooks(newValue);
    setComboData(prev => ({
      ...prev,
      bookIds: newValue.map(book => book.bookId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Bắt đầu gửi

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = comboData.startDate ? new Date(comboData.startDate) : null;
      const end = comboData.endDate ? new Date(comboData.endDate) : null;

      let isActive = false;
      if (start && end) {
        if (today >= start && today <= end) isActive = true;
      } else if (start && !end) {
        if (today >= start) isActive = true;
      }

      const dataToSubmit = {
        ...comboData,
        discountValue: parseFloat(comboData.discountValue),
        startDate: comboData.startDate || null,
        endDate: comboData.endDate || null,
        isActive: isActive
      };

      await createCombo(dataToSubmit);
      
      // 3. Hiển thị thông báo thành công
      setShowSuccess(true);

      // 4. Đợi 1.5 giây để người dùng đọc thông báo rồi mới đóng
      setTimeout(() => {
        handleAddCombo(); // Refresh lại danh sách ở cha
        onClose(); // Đóng modal
      }, 1500);

    } catch (error) {
      console.error('Error creating combo:', error);
      alert('Lỗi: ' + error.message); // Lỗi vẫn giữ alert hoặc dùng snackbar lỗi riêng nếu muốn
      setIsSubmitting(false); // Nếu lỗi thì cho phép gửi lại
    }
  };

  return (
    <>
      <Modal open={true} onClose={onClose}>
        <Box sx={style} component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" component="h2">Tạo Combo Mới</Typography>

          <TextField
            label="Tên Combo"
            name="name"
            value={comboData.name}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Mô tả"
            name="description"
            value={comboData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />

          <Autocomplete
            multiple
            id="combo-books-autocomplete"
            options={allBooks}
            value={selectedBooks}
            onChange={handleBookChange}
            disableCloseOnSelect
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : option.bookName || ''
            }
            isOptionEqualToValue={(option, value) =>
              option.bookId === value.bookId
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Chọn sách áp dụng"
                placeholder="Tìm theo tên sách..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.bookId}
                  variant="outlined"
                  label={option.bookName}
                  {...getTagProps({ index })}
                />
              ))
            }
          />

          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Loại Giảm Giá</InputLabel>
              <Select
                name="discountType"
                value={comboData.discountType}
                label="Loại Giảm Giá"
                onChange={handleChange}
              >
                <MenuItem value="FIXED_AMOUNT">Số tiền cố định</MenuItem>
                <MenuItem value="PERCENT">Phần trăm</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Giá Trị Giảm"
              name="discountValue"
              type="number"
              value={comboData.discountValue}
              onChange={handleChange}
              required
              fullWidth
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              label="Ngày bắt đầu (YYYY-MM-DD)"
              name="startDate"
              type="date"
              value={comboData.startDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Ngày kết thúc (YYYY-MM-DD)"
              name="endDate"
              type="date"
              value={comboData.endDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} variant="outlined" color="secondary">
              Hủy
            </Button>
            {/* Disable nút khi đang submit để tránh spam click */}
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo Combo'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 5. Component Snackbar hiển thị thông báo */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => {}} // Không cần đóng tay, nó sẽ tự đóng khi unmount
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Tạo combo thành công!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddCombo;