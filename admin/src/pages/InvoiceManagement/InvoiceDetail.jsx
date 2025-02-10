import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const InvoiceDetail = ({ invoice, onClose, onUpdatePaymentStatus, onUpdateDeliveryStatus }) => {
    const [paymentStatus, setPaymentStatus] = useState(invoice?.paymentStatus || '');
    const [deliveryStatus, setDeliveryStatus] = useState(invoice?.deliveryStatus || '');
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);

    if (!invoice) return null;

    const handleSavePaymentStatus = () => {
        onUpdatePaymentStatus(invoice.id, paymentStatus);
        setIsUpdatingPayment(false);
    };

    const handleSaveDeliveryStatus = () => {
        onUpdateDeliveryStatus(invoice.id, deliveryStatus);
        setIsUpdatingDelivery(false);
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogTitle>
                Chi tiết hóa đơn
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={onClose}
                    aria-label="close"
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography>ID: {invoice.id}</Typography>
                <Typography>Tên khách hàng: {invoice.customerName}</Typography>
                <Typography>Tổng giá: {invoice.totalPrice} đ</Typography>
                <Typography>Ngày đặt hàng: {invoice.orderDate}</Typography>
                <Typography>Phương thức thanh toán: {invoice.paymentMethod}</Typography>

                {/* Chi tiết đơn hàng */}
                <Typography variant="h6" sx={{ mt: 2 }}>Chi tiết đơn hàng</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Book ID</TableCell>
                            <TableCell>Số lượng</TableCell>
                            <TableCell>Đơn giá</TableCell>
                            <TableCell>Tổng giá</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoice.orderDetail.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.bookId}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.unitPrice} đ</TableCell>
                                <TableCell>{item.totalPrice} đ</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Dialog cập nhật trạng thái thanh toán */}
                <Dialog open={isUpdatingPayment} onClose={() => setIsUpdatingPayment(false)} fullWidth>
                    <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
                    <DialogContent>
                        <Select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="Chờ thanh toán">Chờ thanh toán</MenuItem>
                            <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
                        </Select>
                        <Button variant="contained" color="primary" onClick={handleSavePaymentStatus} sx={{ mt: 2 }}>
                            Lưu trạng thái thanh toán
                        </Button>
                    </DialogContent>
                </Dialog>

                {/* Dialog cập nhật trạng thái giao hàng */}
                <Dialog open={isUpdatingDelivery} onClose={() => setIsUpdatingDelivery(false)} fullWidth>
                    <DialogTitle>Cập nhật trạng thái giao hàng</DialogTitle>
                    <DialogContent>
                        <Select
                            value={deliveryStatus}
                            onChange={(e) => setDeliveryStatus(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                            <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
                            <MenuItem value="Đang vận chuyển">Đang vận chuyển</MenuItem>
                            <MenuItem value="Đã vận chuyển">Đã vận chuyển</MenuItem>
                            <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                        </Select>
                        <Button variant="contained" color="secondary" onClick={handleSaveDeliveryStatus} sx={{ mt: 2 }}>
                            Lưu trạng thái giao hàng
                        </Button>
                    </DialogContent>
                </Dialog>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button variant="contained" color="primary" onClick={() => setIsUpdatingPayment(true)} sx={{ mr: 2 }}>
                        Cập nhật trạng thái thanh toán
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => setIsUpdatingDelivery(true)}>
                        Cập nhật trạng thái giao hàng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceDetail;
