import React, { useState } from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import InvoiceDetail from './InvoiceDetail';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, TextField, Box
} from '@mui/material';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([
    {
      id: '1',
      customerName: 'John Doe',
      totalPrice: 200000,
      orderDate: '2024-11-05',
      paymentMethod: 'Cash',
      paymentStatus: 'Chờ thanh toán',
      deliveryStatus: 'Chờ xác nhận',
      phone: '123456789',
      address: '123 Main St',
      orderDetail: [
        { bookId: 'B001', quantity: 2, unitPrice: 50000, totalPrice: 100000 },
        { bookId: 'B002', quantity: 1, unitPrice: 100000, totalPrice: 100000 }
      ]
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseDetails = () => {
    setSelectedInvoice(null);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    return (filterStatus === 'Tất cả' || invoice.deliveryStatus === filterStatus) &&
           (invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.id.includes(searchTerm));
  });

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-white shadow-md z-50">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex">
        <Header title="Invoice Management" />

        <div className="p-10 pt-20 flex w-full flex-col" style={{ gap: '1rem' }}>
          <Box sx={{ mb: 2 }}>
            {['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang vận chuyển', 'Đã giao hàng', 'Đã hủy'].map((status) => (
              <Button key={status} variant={filterStatus === status ? 'contained' : 'outlined'} 
                onClick={() => handleFilterChange(status)}
                sx={{ m: 1 }}
              >
                {status}
              </Button>
            ))}
          </Box>

          <TextField 
            label="Tìm kiếm đơn hàng"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tên khách hàng</TableCell>
                  <TableCell>Tổng giá</TableCell>
                  <TableCell>Ngày đặt hàng</TableCell>
                  <TableCell>Phương thức thanh toán</TableCell>
                  <TableCell>Trạng thái thanh toán</TableCell>
                  <TableCell>Trạng thái giao hàng</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Địa chỉ giao hàng</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{invoice.totalPrice} đ</TableCell>
                    <TableCell>{invoice.orderDate}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell>{invoice.paymentStatus}</TableCell>
                    <TableCell>{invoice.deliveryStatus}</TableCell>
                    <TableCell>{invoice.phone}</TableCell>
                    <TableCell>{invoice.address}</TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => handleViewDetails(invoice)}>Xem chi tiết</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedInvoice && (
            <InvoiceDetail 
              invoice={selectedInvoice} 
              onClose={handleCloseDetails} 
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default InvoiceManagement;
