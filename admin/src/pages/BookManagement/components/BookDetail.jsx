import React, { useState } from "react";
import { Box, Typography, Divider, Button, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import UpdateBook from "./UpdateBook";
import { useBookDetail } from "../hooks/useBookDetail";

const BookDetail = ({ selectedBook, handleDeleteBook }) => {
  const { openUpdateModal, handleOpenUpdateModal, handleCloseUpdateModal } =
    useBookDetail();

  // Slider state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!selectedBook) return null;

  // lấy mảng ảnh (mặc định [])
  const images = selectedBook.bookImages || [];

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Box
      width="800px"
      p={3}
      role="presentation"
      display="flex"
      flexDirection="column"
      sx={{ paddingTop: 1 }}
      tabIndex="-1"
    >
      {/* Thông tin sách */}
      <Box
        display="flex"
        mb={3}
        p={2}
        sx={{ border: "1px solid #ddd", borderRadius: "8px" }}
      >
        {/* Ảnh + tên */}
        <Box
          sx={{
            width: "35%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
        {/* Slider ảnh */}
        <Box
          sx={{
            position: "relative",
            width: "260px",
            height: "320px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #ddd",
            backgroundColor: "#fafafa", // thêm nền xám nhạt khi ảnh không fill hết
          }}
        >
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]}
              alt={`${selectedBook.bookName}-${currentImageIndex}`}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <Typography variant="body2" color="textSecondary">
              Không có ảnh
            </Typography>
          )}

          {/* Nút chuyển ảnh */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 5,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255,255,255,0.7)",
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 5,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255,255,255,0.7)",
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
        </Box>
          {/* Tên sách */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 2,
              width: "100%",
            }}
          >
            {selectedBook.bookName}
          </Typography>

          {/* Mã sách */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              ml: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "gray", textAlign: "left" }}
            >
              Mã sách: {selectedBook.bookId}
            </Typography>
          </Box>
        </Box>

        {/* Thông tin chi tiết */}
        <Box sx={{ width: "65%", p: 2 }}>
          <Divider sx={{ width: "100%", mb: 2 }} />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            {[
              { label: "Loại sách", value: selectedBook.bookCategory },
              { label: "Năm sản xuất", value: selectedBook.bookYearOfProduction },
              { label: "Giá", value: `${selectedBook.bookPrice}₫` },
              { label: "Nhà XB", value: selectedBook.bookPublisher },
              { label: "Tác giả", value: selectedBook.bookAuthor },
              { label: "Ngôn ngữ", value: selectedBook.bookLanguage },
              { label: "Số lượng tồn kho", value: selectedBook.bookStockQuantity },
              { label: "Nhà cung cấp", value: selectedBook.bookSupplier },
            ].map((item, index) => (
              <Box key={index} sx={{ width: "100%" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  {item.label}:
                </Typography>
                <textarea
                  value={item.value}
                  readOnly
                  tabIndex="-1"
                  style={{
                    width: "100%",
                    minHeight: "30px",
                    padding: "2px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "#f9f9f9",
                    resize: "vertical",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Mô tả */}
      <Box
        sx={{
          width: "100%",
          p: 2,
          mb: 1,
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: "4px",
          }}
        >
          Mô tả:
        </Typography>
        <textarea
          value={selectedBook.bookDescription}
          readOnly
          tabIndex="-1"
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "6px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "#f9f9f9",
            resize: "vertical",
          }}
        />
      </Box>

      {/* Action buttons */}
      <Box width="100%" display="flex" gap={2} p={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenUpdateModal}
          fullWidth
        >
          Sửa sách
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteBook}
          fullWidth
        >
          Xóa sách
        </Button>
      </Box>

      {/* Update modal */}
      {openUpdateModal && (
        <UpdateBook
          book={selectedBook}
          onUpdate={() => {
            // callback sau khi update
          }}
          onClose={handleCloseUpdateModal}
        />
      )}
    </Box>
  );
};

export default BookDetail;
