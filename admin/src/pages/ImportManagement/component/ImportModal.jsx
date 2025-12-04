import React from "react";
import {
  TextField, Button, Typography, Box, Grid, Divider, IconButton, Alert
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { Add, Delete } from '@mui/icons-material';
import { useImportStock } from "../hooks/useImportStock";

const ImportModal = ({ onClose }) => {
  const {
    books, excelFile, isLoading, error,
    handleInputChange, handleAddRow, handleRemoveRow,
    handleManualImport, handleExcelChange, handleExcelImport,
  } = useImportStock(onClose);

  return (
    <Box className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <Box className="bg-white p-6 rounded-lg w-11/12 max-w-4xl border-2 border-gray-300 shadow-lg relative">
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h4" className="text-center text-gradient" mb={2}>
          Nhập kho sách
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Form nhập thủ công */}
        <Typography variant="h6" mb={2}>Nhập thủ công</Typography>
        <form onSubmit={handleManualImport}>
          <Box className="max-h-60 overflow-y-auto pr-2">
            {books.map((book, index) => (
              <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={3}> {/* ĐÃ SỬA: sm={5} -> sm={3} */}
                  <TextField
                    label="Tên sách"
                    name="bookName"
                    fullWidth
                    value={book.bookName}
                    onChange={(e) => handleInputChange(e, index)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={3}> {/* ĐÃ SỬA: sm={4} -> sm={3} */}
                  <TextField
                    label="Tác giả"
                    name="bookAuthor"
                    fullWidth
                    value={book.bookAuthor}
                    onChange={(e) => handleInputChange(e, index)}
                    required
                  />
                </Grid>
                {/* TRƯỜNG MỚI ĐƯỢC THÊM */}
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Nhà cung cấp"
                    name="supplier" // Giả định tên state là 'supplier'
                    fullWidth
                    value={book.bookSupplier || ''} // Thêm '|| ''' để tránh lỗi uncontrolled
                    onChange={(e) => handleInputChange(e, index)}
                    required
                  />
                </Grid>
                {/* -------------------- */}
                <Grid item xs={8} sm={2}>
                  <TextField
                    label="Số lượng"
                    name="bookStockQuantity"
                    type="number"
                    fullWidth
                    value={book.bookStockQuantity}
                    onChange={(e) => handleInputChange(e, index)}
                    required
                  />
                </Grid>
                <Grid item xs={4} sm={1}>
                  <IconButton onClick={() => handleRemoveRow(index)} color="error" disabled={books.length === 1}>
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Box>
          <Button onClick={handleAddRow} startIcon={<Add />} variant="outlined" sx={{ my: 2 }}>
            Thêm sách khác
          </Button>
          <Box className="flex justify-end">
            <Button type="submit" variant="contained" className="submit-button" disabled={isLoading}>
              {isLoading ? "Đang nhập..." : "Lưu thủ công"}
            </Button>
          </Box>
        </form>

        <Divider sx={{ my: 3 }} />

        {/* Phần nhập từ Excel */}
        <Typography variant="h6" mb={2}>Import từ file Excel</Typography>
        <Box className="flex items-center gap-4">
          <Button variant="outlined" component="label">
            Chọn file Excel
            <input type="file" accept=".xlsx,.xls" hidden onChange={handleExcelChange} />
          </Button>
          {excelFile && <Typography variant="body2">{excelFile.name}</Typography>}
          <Button
            variant="contained"
            className="submit-button"
            onClick={handleExcelImport}
            disabled={isLoading || !excelFile}
          >
            {isLoading ? "Đang import..." : "Import Excel"}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default ImportModal;