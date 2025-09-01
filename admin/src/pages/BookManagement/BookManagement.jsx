import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box, Drawer, TextField,
  InputAdornment, IconButton, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Search } from '@mui/icons-material';
import AddBook from './components/AddBook';
import UpdateBook from './components/UpdateBook';
import BookDetail from './components/BookDetail';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';

const BookManagement = () => {
  const [books, setBooks] = useState({ content: [], totalElements: 0 });
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filter, setFilter] = useState('all'); // Thêm state cho combobox lọc

  const apiUrl = 'http://localhost:8081/api/book';

  useEffect(() => {
    fetchBooks();
  }, [page, rowsPerPage, searchTerm, filter]); // Thêm 'filter' vào dependency array

  const fetchBooks = async () => {
    try {
      let url = '';
      let response;

      if (searchTerm) {
        url = `${apiUrl}/search?page=${page}&size=${rowsPerPage}&input=${searchTerm}`;
        response = await axios.post(url);
      } else {
        switch (filter) {
          case 'in-stock':
            url = `${apiUrl}/in-stock?page=${page}&size=${rowsPerPage}`;
            break;
          case 'out-of-stock':
            url = `${apiUrl}/out-of-stock?page=${page}&size=${rowsPerPage}`;
            break;
          case 'all':
          default:
            url = `${apiUrl}?page=${page}&size=${rowsPerPage}`;
            break;
        }
        response = await axios.get(url);
      }

      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setIsDrawerOpen(true);
  };

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleOpenUpdateModal = () => { setIsUpdateModalOpen(true); setIsDrawerOpen(false); };
  const handleCloseUpdateModal = () => { setIsUpdateModalOpen(false); setIsDrawerOpen(true); };

  const handleAddBook = async (newBook) => {
    try {
      await axios.post(apiUrl, newBook);
      fetchBooks();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleUpdateBook = async (updatedBook) => {
    try {
      await axios.put(`${apiUrl}/${selectedBook.bookId}`, updatedBook);
      fetchBooks();
      setSelectedBook(null);
      setIsUpdateModalOpen(false);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const handleDeleteBook = async () => {
    try {
      await axios.delete(`${apiUrl}/${selectedBook.bookId}`);
      fetchBooks();
      setSelectedBook(null);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Thêm handler mới cho combobox
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0); // Reset trang về 0 khi thay đổi bộ lọc
  };

const handleExportBooks = async () => {
  try {
    const response = await axios.get(`${apiUrl}/export_books?filter=${filter}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `books_${filter}.xlsx`;
    link.click();
  } catch (error) {
    console.error('Error exporting books:', error);
  }
};

  return (
    <div className="flex h-screen">
      <div className={`bg-white shadow-md z-50 fixed h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-1/6'}`}>
        <SideNav onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </div>
      <main
        className="flex-1 bg-gray-100 relative flex flex-col transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '5rem' : '16.5%' }}
      >
        <Header title="QUẢN LÝ SÁCH" isCollapsed={isCollapsed} className="sticky top-0 z-50 bg-white shadow-md" />
        <Box className="sticky top-[64px] z-40 bg-gray-100 shadow-md p-4 flex items-center border-b justify-between">
          <Box className="flex-1 flex items-center justify-center">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-[50%]"
              sx={{ borderRadius: '8px', backgroundColor: 'white' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
                style: { borderRadius: '8px' }
              }}
            />
          </Box>
          <Box className="flex gap-2">
            {/* Thêm combobox lọc */}
            <FormControl variant="outlined" size="small" sx={{ width: 150, marginRight: 2 }}>
              <InputLabel id="filter-label">Lọc</InputLabel>
              <Select
                labelId="filter-label"
                value={filter}
                onChange={handleFilterChange}
                label="Lọc"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="in-stock">Còn hàng</MenuItem>
                <MenuItem value="out-of-stock">Hết hàng</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" style={{ backgroundColor: 'blue' }} onClick={handleExportBooks}>
              Export
            </Button>
            <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={handleOpenAddModal}>
              Thêm sách
            </Button>
          </Box>
        </Box>
        <div className="flex-1 overflow-auto pt-[72px] px-2">
          <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    'Id', 'Tên', 'Tác giả', 'Giá', 'Danh mục chính', 'Thể loại',
                    'Năm xuất bản', 'Nhà xuất bản', 'Ngôn ngữ', 'Số lượng tồn kho', 'Nhà cung cấp', 'Mô tả'
                  ].map((header) => (
                    <TableCell key={header}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {books?.content?.map((book) => (
                  <TableRow key={book.bookId} onClick={() => handleSelectBook(book)} hover>
                    {[
                      'bookId', 'bookName', 'bookAuthor', 'bookPrice', 'mainCategory',
                      'bookCategory', 'bookYearOfProduction', 'bookPublisher',
                      'bookLanguage', 'bookStockQuantity', 'bookSupplier', 'bookDescription'
                    ].map((key) => (
                      <TableCell key={key} sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: key === 'bookDescription' ? '150px' : '100px'
                      }}>
                        {book[key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box className="sticky bottom-0 bg-white shadow-md">
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={books?.totalElements || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </div>
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{ width: 400, flexShrink: 0, '& .MuiDrawer-paper': { width: 800, boxSizing: 'border-box' } }}
        >
          <BookDetail selectedBook={selectedBook} handleOpenUpdateModal={handleOpenUpdateModal} handleDeleteBook={handleDeleteBook} />
        </Drawer>
        {isAddModalOpen && <AddBook handleAddBook={handleAddBook} onClose={handleCloseAddModal} />}
        {isUpdateModalOpen && <UpdateBook selectedBook={selectedBook} handleUpdateBook={handleUpdateBook} onClose={handleCloseUpdateModal} />}
      </main>
    </div>
  );
};

export default BookManagement;