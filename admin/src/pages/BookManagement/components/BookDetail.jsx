import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import UpdateBook from "./UpdateBook";
import { useBookDetail } from "../hooks/useBookDetail";

const BookDetail = ({ selectedBook, handleDeleteBook }) => {
  const {
    openUpdateModal,
    handleOpenUpdateModal,
    handleCloseUpdateModal,
  } = useBookDetail();

  if (!selectedBook) return null;

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
          <img
            src={selectedBook.bookImage}
            alt={selectedBook.bookName}
            style={{
              width: "320px",
              height: "320px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
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
              { label: "Giá", value: `$${selectedBook.bookPrice}` },
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
      <Box
        className="flex justify-between"
        width="100%"
        display="flex"
        gap={2}
        p={2}
      >
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
