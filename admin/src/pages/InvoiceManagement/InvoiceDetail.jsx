import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
} from "@mui/material";
import axios from "axios";

const InvoiceDetail = ({ selectedInvoice, onUpdateStatus, onCloseDrawer }) => {
  if (!selectedInvoice) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="textSecondary">
          Chọn một hóa đơn để xem chi tiết
        </Typography>
      </Box>
    );
  }

  const handleUpdateStatus = async (status) => {
    try {
      const orderId = selectedInvoice.orderId;
      const apiUrl = `http://localhost:8082/api/orders/update-shipping-status/${orderId}?shippingStatus=${status}`;

      const response = await axios.put(apiUrl);
      alert("Cập nhật trạng thái thành công!");
      // Gọi hàm onUpdateStatus được truyền từ component cha
      onUpdateStatus(response.data, status);
      onCloseDrawer(); // Đóng drawer sau khi cập nhật thành công
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 4, maxWidth: 600, margin: "auto", borderRadius: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          HÓA ĐƠN THANH TOÁN
        </Typography>
        <Button onClick={onCloseDrawer} size="small">Đóng</Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle1"><strong>Mã hóa đơn:</strong> #{selectedInvoice.orderId}</Typography>
      <Typography variant="subtitle1"><strong>Người nhận:</strong> {selectedInvoice.recipientName}</Typography>
      <Typography variant="subtitle1"><strong>Số điện thoại:</strong> {selectedInvoice.phoneNumber}</Typography>
      <Typography variant="subtitle1"><strong>Địa chỉ:</strong> {selectedInvoice.ward}, {selectedInvoice.district}, {selectedInvoice.city}, {selectedInvoice.country}</Typography>
      <Typography variant="subtitle1"><strong>Tổng tiền:</strong> {selectedInvoice.totalPrice} VND</Typography>
      <Typography variant="subtitle1"><strong>Thanh toán:</strong> {selectedInvoice.paymentMethod}</Typography>
      <Typography variant="subtitle1"><strong>Ngày đặt hàng:</strong> {new Date(selectedInvoice.dateOrder).toLocaleString()}</Typography>
      <Typography variant="subtitle1"><strong>Trạng thái:</strong> {selectedInvoice.shippingStatus}</Typography>

      <Divider sx={{ my: 2 }} />

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center"><strong>Hình ảnh</strong></TableCell>
              <TableCell><strong>Sản phẩm</strong></TableCell>
              <TableCell align="center"><strong>SL</strong></TableCell>
              <TableCell align="right"><strong>Giá</strong></TableCell>
              <TableCell align="right"><strong>Thành tiền</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedInvoice.orderItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell align="center">
                  <img src={item.bookImage} alt={item.bookName} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 5 }} />
                </TableCell>
                <TableCell>{item.bookName}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">{item.price} VND</TableCell>
                <TableCell align="right">{item.quantity * item.price} VND</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="center" gap={2}>
        {selectedInvoice.shippingStatus === "Chờ xử lý" && (
          <Button variant="contained" color="primary" onClick={() => handleUpdateStatus("Đã nhận đơn")}>
            Xác nhận đơn hàng
          </Button>
        )}
        {selectedInvoice.shippingStatus === "Đã nhận đơn" && (
          <Button variant="contained" color="secondary" onClick={() => handleUpdateStatus("Đang giao")}>
            Giao hàng
          </Button>
        )}
        {selectedInvoice.shippingStatus === "Đang giao" && (
          <Button variant="contained" color="success" onClick={() => handleUpdateStatus("Đã giao")}>
            Đã giao
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default InvoiceDetail;