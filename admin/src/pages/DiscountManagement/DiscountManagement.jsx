import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TablePagination, 
  Button, Box, Drawer, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import AddDiscount from './AddDiscount';
import UpdateDiscount from './UpdateDiscount';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState({});
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [bookList, setBookList] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBookSelectOpen, setIsBookSelectOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/discounts?page=${page}&size=${rowsPerPage}`);
        setDiscounts(response.data);
      } catch (error) {
        console.error('Error fetching discounts:', error);
      }
    };
    fetchDiscounts();
  }, [page, rowsPerPage]);

  const fetchBooks = async (discountId) => {
    try {
      // Lấy danh sách tất cả sách
      const bookResponse = await axios.get(`http://localhost:8081/api/book?page=0&size=50`);
      const allBooks = bookResponse.data.content;

      // Lấy danh sách sách đã áp dụng giảm giá
      const discountBooksResponse = await axios.get(`http://localhost:8081/api/discounts/book-discounts`);
      const discountedBookIds = discountBooksResponse.data.map(book => book.bookId);

      // Lọc danh sách sách chưa được áp dụng
      const availableBooks = allBooks.filter(book => !discountedBookIds.includes(book.bookId));

      setBookList(availableBooks);
      setIsBookSelectOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sách:", error);
    }
  };

  const handleApplyDiscount = (discount) => {
    setSelectedDiscount(discount);
    fetchBooks(discount.id);
  };

  const handleBookSelection = (event) => {
    setSelectedBooks(event.target.value);
  };

  const handleConfirmApplyDiscount = async () => {
    if (!selectedDiscount || selectedBooks.length === 0) {
      alert("Vui lòng chọn giảm giá và ít nhất một sách!");
      return;
    }
  
    try {
      await Promise.all(
        selectedBooks.map(async (bookId) => {
          await axios.post("http://localhost:8081/api/discounts/createBookDiscount", {
            bookId: bookId,
            discountId: selectedDiscount.id,
          });
        })
      );
  
      alert(`Đã áp dụng giảm giá ${selectedDiscount?.percentage}% cho sách: ${selectedBooks.join(', ')}`);
      setIsBookSelectOpen(false);
      setSelectedBooks([]);
    } catch (error) {
      console.error("Lỗi khi áp dụng giảm giá:", error);
      alert("Có lỗi xảy ra khi áp dụng giảm giá!");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/6 bg-white shadow-md z-50 fixed h-full">
        <SideNav />
      </div>
      <main className="flex-1 bg-gray-100 relative flex flex-col" style={{ paddingLeft: '14.5%' }}>
        <Header title="Discount Management" />
        <div className="p-10 pt-20 flex w-full overflow-x-auto" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto">
            <Box className="flex justify-between mb-2">
              <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Discount List</Typography>
              <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={() => setIsAddModalOpen(true)}>Add</Button>
            </Box>
            <TableContainer component={Paper} style={{ maxHeight: '70vh', overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Percentage</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {discounts.content?.map((discount) => (
                    <TableRow key={discount.id} hover>
                      <TableCell>{discount.id}</TableCell>
                      <TableCell>{discount.percentage}%</TableCell>
                      <TableCell>{new Date(discount.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(discount.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small" 
                          onClick={() => handleApplyDiscount(discount)}
                        >
                          Áp dụng
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={discounts.totalElements || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
            />
          </Box>
        </div>

        {/* Drawer hiển thị danh sách sách */}
        <Drawer
          anchor="right"
          open={isBookSelectOpen}
          onClose={() => setIsBookSelectOpen(false)}
          sx={{ width: 400, flexShrink: 0, '& .MuiDrawer-paper': { width: 400, boxSizing: 'border-box', padding: '20px' } }}
        >
          <Typography variant="h6" sx={{ marginBottom: 2 }}>Chọn sách để áp dụng</Typography>
          <FormControl fullWidth>
            <InputLabel>Chọn sách</InputLabel>
            <Select
              multiple
              value={selectedBooks}
              onChange={handleBookSelection}
              renderValue={(selected) => selected.join(', ')}
            >
              {bookList.map((book) => (
                <MenuItem key={book.bookId} value={book.bookId}>
                  {book.bookName} - {book.bookPrice}đ
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            color="secondary" 
            sx={{ marginTop: 2 }} 
            onClick={handleConfirmApplyDiscount}
          >
            Xác nhận
          </Button>
        </Drawer>

        {isAddModalOpen && <AddDiscount onClose={() => setIsAddModalOpen(false)} />}
        {isUpdateModalOpen && <UpdateDiscount selectedDiscount={selectedDiscount} onClose={() => setIsUpdateModalOpen(false)} />}
      </main>
    </div>
  );
};

export default DiscountManagement;
