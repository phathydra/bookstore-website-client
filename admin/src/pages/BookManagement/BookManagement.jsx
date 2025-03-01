import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box, Drawer
} from '@mui/material';
import { Resizable } from 'react-resizable';
import AddBook from './AddBook';
import UpdateBook from './UpdateBook';
import BookDetail from './BookDetail'; // Import the new BookDetail component

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [displayedBooks, setDisplayedBooks] = useState([])

  useEffect(() => {
    fetchBooks();
  }, [page, rowsPerPage]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/book?page=${page}&size=${rowsPerPage}`);
      console.log("fetching with " + page + " " + rowsPerPage);
      setBooks(response.data);
      setDisplayedBooks(response.data?.content || [])
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sách:', error);
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setIsDrawerOpen(true);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
    setIsDrawerOpen(false); 
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setIsDrawerOpen(true); 
  };

  const handleAddBook = async (newBook) => {
    try {
      const response = await axios.post('http://localhost:8081/api/book', newBook);
      setBooks([...books, response.data]);
    } catch (error) {
      console.error('Lỗi khi thêm sách:', error);
    }
  };

  const handleUpdateBook = async (updatedBook) => {
    try {
      await axios.put(`http://localhost:8081/api/book/${selectedBook.bookId}`, updatedBook);
      setBooks(books.content.map(book => book.bookId === selectedBook.bookId ? updatedBook : book));
      setSelectedBook(null);
      setIsUpdateModalOpen(false); 
      setIsDrawerOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Lỗi khi cập nhật sách:', error);
    }
  };

  const handleDeleteBook = async () => {
    try {
      await axios.delete(`http://localhost:8081/api/book/${selectedBook.bookId}`);
      setBooks(books.filter(book => book.bookId !== selectedBook.bookId));
      setSelectedBook(null);
      setIsDrawerOpen(false); 
    } catch (error) {
      console.error('Lỗi khi xóa sách:', error);
    }
  };

  const ResizableCell = (props) => {
    const { width, ...restProps } = props;

    if (!width) {
      return <TableCell {...restProps} />;
    }

    return (
      <Resizable width={width} height={0} handle={<span className="react-resizable-handle" />}>
        <TableCell {...restProps} />
      </Resizable>
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const displayedBooks = books.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="flex h-screen">
      <div className="w-1/6 bg-white shadow-md z-50 fixed h-full">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex flex-col" style={{ paddingLeft: '14.5%' }}>
        <Header title="Book Management" />

        <div className="p-10 pt-20 flex w-full overflow-x-auto" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto">
            <Box className="flex justify-between mb-2">
              <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Bảng danh sách sách
              </Typography>
              <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={handleOpenAddModal}>Thêm</Button>
            </Box>

            <TableContainer component={Paper} style={{ maxHeight: '70vh', overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <ResizableCell width={80}>ID</ResizableCell>
                    <ResizableCell width={150}>Tên</ResizableCell>
                    <ResizableCell width={150}>Tác giả</ResizableCell>
                    <ResizableCell width={80}>Giá</ResizableCell>
                    <ResizableCell width={120}>Thể loại</ResizableCell>
                    <ResizableCell width={80}>Năm SX</ResizableCell>
                    <ResizableCell width={120}>Nhà XB</ResizableCell>
                    <ResizableCell width={120}>Ngôn ngữ</ResizableCell>
                    <ResizableCell width={120}>Số lượng tồn kho</ResizableCell>
                    <ResizableCell width={120}>Nhà cung cấp</ResizableCell>
                    <ResizableCell width={200}>Mô tả</ResizableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedBooks.map((book) => (
                    <TableRow key={book.bookId} onClick={() => handleSelectBook(book)} hover>
                      <TableCell>{book.bookId}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{book.bookName}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{book.bookAuthor}</TableCell>
                      <TableCell>{book.bookPrice}</TableCell>
                      <TableCell>{book.bookCategory}</TableCell>
                      <TableCell>{book.bookYearOfProduction}</TableCell>
                      <TableCell>{book.bookPublisher}</TableCell>
                      <TableCell>{book.bookLanguage}</TableCell>
                      <TableCell>{book.bookStockQuantity}</TableCell>
                      <TableCell>{book.bookSupplier}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{book.bookDescription}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={books.totalElements}
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
          sx={{
            width: 400,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 800,
              boxSizing: 'border-box',
            },
          }}
        >
          <BookDetail 
            selectedBook={selectedBook} 
            handleOpenUpdateModal={handleOpenUpdateModal}
            handleDeleteBook={handleDeleteBook}
          />
        </Drawer>

        {isAddModalOpen && <AddBook handleAddBook={handleAddBook} onClose={handleCloseAddModal} />}
        {isUpdateModalOpen && <UpdateBook selectedBook={selectedBook} handleUpdateBook={handleUpdateBook} onClose={handleCloseUpdateModal} />}
      </main>
    </div>
  );
};

export default BookManagement;
