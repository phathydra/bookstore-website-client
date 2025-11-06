// src/pages/DeliveryUnitDashboard/component/OrderDetailDialog.js
import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, CircularProgress, Typography, Grid,
    Box, Chip, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

// Hàm format tiền
const formatCurrency = (value) => {
    if (typeof value !== 'number') value = 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Hàm format ngày tháng
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Ngày không hợp lệ';
    }
};

// Component này chỉ hiển thị, không cần prop onUpdateStatus
const OrderDetailDialog = ({ open, onClose, order, loading, error }) => {

    // Lấy ID đơn hàng
    const orderId = order?.orderId || order?._id?.$oid;

    // Tính toán tiền hàng
    const itemsPrice = order?.orderItems?.reduce((acc, item) => acc + (item.quantity * item.price), 0) || 0;
    const otherFees = (order?.totalPrice || 0) - itemsPrice;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
                Chi tiết hóa đơn
            </DialogTitle>
            
            <DialogContent dividers sx={{ bgcolor: '#f9f9f9' }}>
                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Đang tải chi tiết...</Typography>
                    </Box>
                )}

                {!loading && error && (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                        <Typography variant="body1" color="error" align="center">
                            {error}
                        </Typography>
                    </Box>
                )}

                {!loading && !error && order && (
                    <Box sx={{ p: { xs: 1, sm: 2 } }}>
                         <Typography variant="subtitle1"><strong>Mã hóa đơn:</strong> #{orderId}</Typography>
                         <Typography variant="subtitle1"><strong>Người nhận:</strong> {order.recipientName}</Typography>
                         <Typography variant="subtitle1"><strong>Số điện thoại:</strong> {order.phoneNumber}</Typography>
                         <Typography variant="subtitle1"><strong>Địa chỉ:</strong> {`${order.note || ''}, ${order.ward}, ${order.district}, ${order.city}`}</Typography>
                         <Typography variant="subtitle1"><strong>Tổng tiền:</strong> <span style={{ color: 'red', fontWeight: 'bold' }}>{formatCurrency(order.totalPrice)}</span></Typography>
                         <Typography variant="subtitle1"><strong>Thanh toán:</strong> {order.paymentMethod}</Typography>
                         
                         {/* === DÒNG ĐÃ SỬA === */}
                         <Typography variant="subtitle1"><strong>Ngày đặt hàng:</strong> {formatDate(order.dateOrder)}</Typography>
                         {/* =================== */}

                         <Typography variant="subtitle1"><strong>Trạng thái:</strong> 
                            <Chip label={order.shippingStatus} color="info" size="small" sx={{ ml: 1 }} />
                         </Typography>

                         <Divider sx={{ my: 2 }} />

                         <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                                    <TableRow>
                                        <TableCell align="center"><strong>Hình ảnh</strong></TableCell>
                                        <TableCell><strong>Sản phẩm</strong></TableCell>
                                        <TableCell align="center"><strong>SL</strong></TableCell>
                                        <TableCell align="right"><strong>Giá</strong></TableCell>
                                        <TableCell align="right"><strong>Thành tiền</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.orderItems?.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell align="center">
                                                <img src={item.bookImage || item.bookImage} alt={item.bookName} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 5 }} />
                                            </TableCell>
                                            <TableCell>{item.bookName}</TableCell>
                                            <TableCell align="center">{item.quantity}</TableCell>
                                            <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                                            <TableCell align="right">{formatCurrency(item.quantity * item.price)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Dòng tổng */}
                                    <TableRow>
                                        <TableCell colSpan={3} />
                                        <TableCell align="right"><strong>Tiền hàng:</strong></TableCell>
                                        <TableCell align="right">{formatCurrency(itemsPrice)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} />
                                        <TableCell align="right"><strong>Phí khác:</strong></TableCell>
                                        <TableCell align="right">{formatCurrency(otherFees)}</TableCell>
                                    </TableRow>
                                    <TableRow sx={{ '& > *': { borderBottom: 'unset !important' } }}>
                                        <TableCell colSpan={3} />
                                        <TableCell align="right"><Typography variant="h6">Tổng cộng:</Typography></TableCell>
                                        <TableCell align="right"><Typography variant="h6" color="error">{formatCurrency(order.totalPrice)}</Typography></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                         </TableContainer>
                    </Box>
                )}
            </DialogContent>

            {/* Chỉ còn nút Đóng */}
            <DialogActions sx={{ borderTop: '1px solid #e0e0e0', bgcolor: 'white', p: 2, justifyContent: 'flex-end' }}>
                <Button onClick={onClose} color="primary" variant="contained">
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailDialog;