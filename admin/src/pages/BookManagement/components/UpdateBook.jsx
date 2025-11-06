import React, { useEffect, useRef } from "react";
import {
  TextField, Button, Typography, Box,
  MenuItem, Select, FormControl, InputLabel, Grid, Divider, IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useUpdateBook } from "../hooks/useUpdateBook";
import "./UpdateBook.css";

// Giữ nguyên các hằng số: mainCategories, publishers, suppliers, languages

const mainCategories = {
  "Văn Học": ["Tiểu thuyết", "Truyện ngắn", "Thơ ca", "Kịch", "Ngụ ngôn"],
  "Giáo Dục & Học Thuật": ["Sách giáo khoa", "Sách tham khảo", "Ngoại ngữ", "Sách khoa học"],
  "Kinh Doanh & Phát Triển Bản Thân": ["Quản trị", "Tài chính", "Khởi nghiệp", "Lãnh đạo", "Kỹ năng sống"],
  "Khoa Học & Công Nghệ": ["Vật lý", "Hóa học", "Sinh học", "Công nghệ", "Lập trình"],
  "Lịch Sử & Địa Lý": ["Lịch sử thế giới", "Lịch sử Việt Nam", "Địa lý"],
  "Tôn Giáo & Triết Học": ["Phật giáo", "Thiên Chúa giáo", "Hồi giáo", "Triết học"],
  "Sách Thiếu Nhi": ["Truyện cổ tích", "Truyện tranh", "Truyện chữ", "Sách giáo dục trẻ em"],
  "Văn Hóa & Xã Hội": ["Du lịch", "Nghệ thuật", "Tâm lý - xã hội"],
  "Sức Khỏe & Ẩm Thực": ["Nấu ăn", "Dinh dưỡng", "Thể dục - thể thao"]
};

const publishers = [
  "NXB Trẻ", "NXB Kim Đồng", "NXB Giáo dục Việt Nam", "NXB Chính trị quốc gia Sự thật","NXB Kinh Tế TP.Hồ Chí Minh",
  "NXB Tổng hợp TP.HCM", "NXB Phụ nữ Việt Nam", "NXB Hội Nhà văn", "NXB Lao động","NXB Mỹ Thuật","NXB Hồng Đức",
  "NXB Dân trí", "NXB Văn học", "NXB Khoa học xã hội", "NXB ĐHQG Hà Nội", "NXB Thế Giới","NXB Văn Hóa Văn Nghệ"
];
const suppliers = [
  "Nhã Nam", "Alpha Books", "Megabooks", "Kim Đồng", "Kinokuniya","CÔNG TY CỔ PHẦN SÁCH TRÍ THỨC VIỆT","Công ty TNHH Ecoblader",
  "NXB Trẻ", "Đinh Tị", "AZ Việt Nam", "Tân Việt","Tổng Hợp TPHCM","Đông A","Nhà xuất bản Giáo Dục"
];
const languages = ["Tiếng Việt", "Tiếng Anh", "Tiếng Nhật", "Tiếng Trung", "Tiếng Hàn"];

const UpdateBook = ({ book, onUpdate, onClose }) => {
  const formRef = useRef(null);

  const {
    formData,
    imagePreviewUrls,
    isLoading,
    error,
    handleChange,
    handleUpdate,
    handleDeleteImage, // Lấy hàm xóa ảnh từ hook
  } = useUpdateBook(book, onClose, onUpdate);

  // Thêm hiệu ứng click ra ngoài để đóng modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.querySelector(".MuiMenu-paper");
      if (formRef.current && !formRef.current.contains(event.target) && (!menu || !menu.contains(event.target))) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <Box ref={formRef} className="bg-white p-6 rounded-lg w-11/12 max-w-6xl border-2 border-gray-300 shadow-lg">
        <Typography variant="h4" className="text-center text-gradient" mb={4}>
          Cập nhật thông tin sách
        </Typography>

        <form onSubmit={handleUpdate}>
          <Grid container spacing={4}>
            {/* LEFT COLUMN */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {/* Book Name */}
                <Grid item xs={6}>
                  <TextField
                    label="Tên sách"
                    name="bookName"
                    fullWidth
                    variant="outlined"
                    value={formData.bookName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                {/* Author */}
                <Grid item xs={6}>
                  <TextField
                    label="Tác giả"
                    name="bookAuthor"
                    fullWidth
                    variant="outlined"
                    value={formData.bookAuthor}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                {/* Year of Production */}
                <Grid item xs={6}>
                  <TextField
                    label="Năm xuất bản"
                    name="bookYearOfProduction"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={formData.bookYearOfProduction}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                {/* Price */}
                <Grid item xs={6}>
                  <TextField
                    label="Giá"
                    name="bookPrice"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={formData.bookPrice}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                {/* Stock Quantity */}
                <Grid item xs={6}>
                  <TextField
                    label="Số lượng"
                    name="bookStockQuantity"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={formData.bookStockQuantity}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                {/* Language */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Ngôn ngữ</InputLabel>
                    <Select
                      name="bookLanguage"
                      value={formData.bookLanguage}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value=""><em>Chọn ngôn ngữ</em></MenuItem>
                      {languages.map((lang) => (
                        <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Publisher */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Nhà xuất bản</InputLabel>
                    <Select
                      name="bookPublisher"
                      value={formData.bookPublisher}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value=""><em>Chọn NXB</em></MenuItem>
                      {publishers.map((p) => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Supplier */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Nhà cung cấp</InputLabel>
                    <Select
                      name="bookSupplier"
                      value={formData.bookSupplier}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value=""><em>Chọn NCC</em></MenuItem>
                      {suppliers.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Main Category -- ĐÃ CẬP NHẬT */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Danh mục chính</InputLabel>
                    <Select
                      name="mainCategory"
                      value={formData.mainCategory}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value=""><em>Chọn danh mục</em></MenuItem>
                      
                      {/* 1. Render các danh mục hợp lệ như cũ */}
                      {Object.keys(mainCategories).map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}

                      {/* 2. Kiểm tra và render giá trị cũ nếu không hợp lệ */}
                      {formData.mainCategory && !mainCategories[formData.mainCategory] && (
                        <MenuItem 
                          key={formData.mainCategory} 
                          value={formData.mainCategory} 
                          sx={{ color: 'red', fontStyle: 'italic' }}
                        >
                          {formData.mainCategory} (Dữ liệu cũ)
                        </MenuItem>
                      )}

                    </Select>
                  </FormControl>
                </Grid>

                {/* Book Category -- ĐÃ CẬP NHẬT */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Thể loại</InputLabel>
                    <Select
                      name="bookCategory"
                      value={formData.bookCategory}
                      onChange={handleChange}
                      required
                      disabled={!formData.mainCategory}
                    >
                      <MenuItem value=""><em>Chọn thể loại</em></MenuItem>

                      {/* 1. Dùng (mainCategories[formData.mainCategory] || []) để tránh lỗi */}
                      {(mainCategories[formData.mainCategory] || []).map((sub) => (
                        <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                      ))}

                      {/* 2. Kiểm tra và render giá trị cũ (của thể loại con) nếu không hợp lệ */}
                      {formData.bookCategory && 
                       !(mainCategories[formData.mainCategory] || []).includes(formData.bookCategory) && (
                        <MenuItem 
                          key={formData.bookCategory} 
                          value={formData.bookCategory}
                          sx={{ color: 'red', fontStyle: 'italic' }}
                        >
                          {formData.bookCategory} (Dữ liệu cũ)
                        </MenuItem>
                      )}

                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    label="Mô tả sách"
                    name="bookDescription"
                    fullWidth
                    variant="outlined"
                    value={formData.bookDescription}
                    onChange={handleChange}
                    multiline
                    rows={5}
                    placeholder="Nhập mô tả sách..."
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* RIGHT COLUMN - IMAGES */}
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 300,
                    height: 440,
                    border: "2px dashed #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    bgcolor: "#fafafa",
                    overflow: "auto",
                    flexWrap: "wrap",
                    p: 1,
                  }}
                >
                  {imagePreviewUrls.length > 0 ? (
                    <Box sx={{
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1,
                        width: '100%',
                        justifyContent: 'center'
                    }}>
                      {imagePreviewUrls.map((url, index) => (
                        <Box key={index} sx={{
                          position: "relative",
                          width: "calc(50% - 4px)", // Đảm bảo 2 ảnh trên 1 hàng
                          height: 200,
                          borderRadius: 2,
                          overflow: 'hidden'
                        }}>
                          <img
                            src={url}
                            alt={`preview-${index}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          {/* Nút xóa ảnh */}
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleDeleteImage(index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              color: "#f44336",
                              bgcolor: "rgba(255, 255, 255, 0.7)",
                              "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Chưa có ảnh
                    </Typography>
                  )}
                </Box>
                <Button variant="contained" component="label" fullWidth>
                  Chọn hình ảnh
                  <input
                    type="file"
                    name="bookImages"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleChange}
                  />
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Action buttons */}
          <Box className="flex justify-between items-center mt-2">
            <Box className="space-x-3">
              <Button onClick={onClose} className="cancel-button">Hủy</Button>
              <Button type="submit" variant="contained" className="submit-button" disabled={isLoading}>
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </Box>
          </Box>

          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </form>
      </Box>
    </Box>
  );
};

export default UpdateBook;