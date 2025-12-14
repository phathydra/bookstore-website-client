import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, Button, Drawer, IconButton, CircularProgress, List, ListItem, ListItemText, ListItemAvatar, Avatar } from "@mui/material";
import { Close as CloseIcon } from '@mui/icons-material';
import axios from "axios";

const DetailItem = ({ label, value }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '13px' }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ ml: 1, fontSize: '15px' }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

const formatDisplayDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const ComboDetail = ({ selectedCombo, onClose, onEdit, onDelete }) => {
  const [bookDetails, setBookDetails] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  useEffect(() => {
    if (selectedCombo && selectedCombo.bookIds && selectedCombo.bookIds.length > 0) {
      setLoadingBooks(true);
      const fetchBookDetails = async () => {
        try {
          const bookPromises = selectedCombo.bookIds.map(id =>
            axios.get(`http://localhost:8081/api/book/${id}`)
          );
          const responses = await Promise.all(bookPromises);
          setBookDetails(responses.map(res => res.data)); 
        } catch (error) {
          console.error("Lỗi khi tải chi tiết sách:", error);
          setBookDetails([]);
        } finally {
          setLoadingBooks(false);
        }
      };
      fetchBookDetails();
    } else {
      setBookDetails([]);
    }
  }, [selectedCombo]);

  const handleDeleteClick = () => {
    if (window.confirm('Bạn có chắc muốn xóa combo này?')) {
      onDelete(selectedCombo.comboId);
    }
  };

  const getComboStatus = () => {
    if (!selectedCombo) return { text: '', color: 'default' };
    if (!selectedCombo.startDate || !selectedCombo.endDate) return { text: 'Chưa thiết lập', color: 'text.secondary' };
    
    const now = new Date();
    const start = new Date(selectedCombo.startDate);
    const end = new Date(selectedCombo.endDate);

    if (now < start) return { text: 'Chưa bắt đầu', color: 'blue' };
    if (now > end) return { text: 'Đã kết thúc', color: 'red' };
    return { text: 'Đang hoạt động', color: 'green' };
  };

  const status = getComboStatus();

  return (
    <Drawer anchor="right" open={Boolean(selectedCombo)} onClose={onClose}>
      <Box width="450px" p={2} role="presentation" display="flex" flexDirection="column" sx={{ height: '100%' }}>
        {selectedCombo ? (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Chi Tiết Combo</Typography>
              <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
              
              {/* --- HIỂN THỊ ẢNH COMBO --- */}
              {selectedCombo.image ? (
                <Box sx={{ width: '100%', mb: 3, borderRadius: 2, overflow: 'hidden', border: '1px solid #eee', boxShadow: 1 }}>
                   <img 
                      src={selectedCombo.image} 
                      alt={selectedCombo.name} 
                      style={{ width: '100%', height: '220px', objectFit: 'cover' }} 
                   />
                </Box>
              ) : (
                <Box sx={{ width: '100%', height: 100, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f0f0', borderRadius: 2 }}>
                    <Typography color="text.secondary">Không có ảnh</Typography>
                </Box>
              )}
              {/* -------------------------- */}

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                <DetailItem label="Tên Combo" value={selectedCombo.name} />
                <DetailItem label="Loại giảm giá" value={selectedCombo.discountType} />
                <DetailItem label="Trạng thái" value={
                    <Typography component="span" sx={{ color: status.color, fontWeight: 'bold' }}>{status.text}</Typography>
                } />
                <DetailItem label="Giá trị giảm" value={
                  selectedCombo.discountType === 'PERCENT' ? `${selectedCombo.discountValue}%` : `${selectedCombo.discountValue.toLocaleString()}₫`
                } />
                <DetailItem label="Ngày bắt đầu" value={formatDisplayDate(selectedCombo.startDate)} />
                <DetailItem label="Ngày kết thúc" value={formatDisplayDate(selectedCombo.endDate)} />
              </Box>

              <Divider sx={{ my: 2 }} />
              <DetailItem label="Mô tả" value={selectedCombo.description} />
              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '13px', mb: 1 }}>
                Các sách áp dụng ({selectedCombo.bookIds.length}):
              </Typography>
              
              {loadingBooks ? (
                <CircularProgress size={24} />
              ) : (
                <List dense sx={{ maxHeight: 200, overflowY: 'auto', background: '#f9f9f9', borderRadius: 1 }}>
                  {bookDetails.map(book => (
                    <ListItem key={book.bookId}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar variant="rounded" src={book.bookImages?.[0] || ''} alt={book.bookName} sx={{ width: 32, height: 40 }} />
                      </ListItemAvatar>
                      <ListItemText primary={book.bookName} primaryTypographyProps={{ fontSize: '14px', noWrap: true }} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Divider sx={{ mt: 2 }} />
            <Box className="flex" width="100%" display="flex" gap={2} pt={2}>
              <Button variant="contained" color="primary" onClick={onEdit} fullWidth>Sửa</Button>
              <Button variant="contained" color="error" onClick={handleDeleteClick} fullWidth>Xóa</Button>
            </Box>
          </>
        ) : (
          <Typography>Không có combo nào được chọn.</Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default ComboDetail;