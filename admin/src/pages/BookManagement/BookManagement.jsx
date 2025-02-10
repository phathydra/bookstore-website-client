import React, { useState } from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header'; 
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box, Card, CardContent, Divider
} from '@mui/material';
import AddBook from './AddBook';
import UpdateBook from './UpdateBook';

const BookManagement = () => {
  const [books, setBooks] = useState([
    {
      _id: '1',
      name: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      price: 10.99,
      genre: 'Fiction',
      year: 1925,
      publisher: 'Scribner',
      language: 'English',
      stock: 50,
      image: 'https://example.com/gatsby.jpg',
      supplier: 'Penguin Books',
      description: 'A classic novel set in the 1920s.'
    }
  ]);

  const [selectedBook, setSelectedBook] = useState(null); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleAddBook = (newBook) => {
    setBooks([...books, { ...newBook, _id: `${books.length + 1}` }]);
  };

  const handleUpdateBook = (updatedBook) => {
    setBooks(books.map(book => book._id === selectedBook._id ? { ...updatedBook, _id: selectedBook._id } : book));
    setSelectedBook(null);
  };

  const handleDeleteBook = () => {
    setBooks(books.filter(book => book._id !== selectedBook._id));
    setSelectedBook(null);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-white shadow-md z-50">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex">
        <Header title="Book Management" />

        <div className="p-10 pt-20 flex w-full" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto">
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
              Bảng danh sách sách
            </Typography>

            <TableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Tác giả</TableCell>
                    <TableCell>Giá</TableCell>
                    <TableCell>Thể loại</TableCell>
                    <TableCell>Năm SX</TableCell>
                    <TableCell>Nhà XB</TableCell>
                    <TableCell>Ngôn ngữ</TableCell>
                    <TableCell>Số lượng tồn kho</TableCell>
                    <TableCell>Nhà cung cấp</TableCell>
                    <TableCell>Mô tả</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book._id} onClick={() => handleSelectBook(book)} hover>
                      <TableCell>{book._id}</TableCell>
                      <TableCell>{book.name}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.price}</TableCell>
                      <TableCell>{book.genre}</TableCell>
                      <TableCell>{book.year}</TableCell>
                      <TableCell>{book.publisher}</TableCell>
                      <TableCell>{book.language}</TableCell>
                      <TableCell>{book.stock}</TableCell>
                      <TableCell>{book.supplier}</TableCell>
                      <TableCell>{book.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={books.length}
              rowsPerPage={10}
              page={0}
            />
          </Box>

          <Box className="w-1/3 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg flex flex-col justify-between">
            <Card variant="outlined">
              <CardContent>
                {selectedBook ? (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedBook.name}</Typography>
                    <Typography>Author: {selectedBook.author}</Typography>
                    <Typography>Price: ${selectedBook.price}</Typography>
                    <Typography>Genre: {selectedBook.genre}</Typography>
                    <Typography>Year: {selectedBook.year}</Typography>
                    <Typography>Publisher: {selectedBook.publisher}</Typography>
                    <Typography>Language: {selectedBook.language}</Typography>
                    <Typography>Stock: {selectedBook.stock}</Typography>
                    <Typography>Supplier: {selectedBook.supplier}</Typography>
                    <Typography>Description: {selectedBook.description}</Typography>
                    <Divider sx={{ width: '100%', mb: 2 }} />
                    <img src={selectedBook.image} alt={selectedBook.name} style={{ width: '100%', borderRadius: '4px' }} />
                  </>
                ) : (
                  <Typography>Chọn một sách để xem chi tiết</Typography>
                )}
              </CardContent>
            </Card>

            <Box className="flex justify-center space-x-4">
              <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={handleOpenAddModal}>Thêm</Button>
              <Button variant="contained" disabled={!selectedBook} onClick={handleOpenUpdateModal}>Sửa</Button>
              <Button variant="contained" color="error" disabled={!selectedBook} onClick={handleDeleteBook}>Xóa</Button>
            </Box>
          </Box>
        </div>

        {isAddModalOpen && <AddBook onAdd={handleAddBook} onClose={handleCloseAddModal} />}
        {isUpdateModalOpen && selectedBook && <UpdateBook book={selectedBook} onUpdate={handleUpdateBook} onClose={handleCloseUpdateModal} />}
      </main>
    </div>
  );
};

export default BookManagement;
