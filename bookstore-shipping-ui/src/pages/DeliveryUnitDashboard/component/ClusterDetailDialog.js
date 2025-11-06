// src/pages/DeliveryUnitDashboard/component/ClusterDetailDialog.js
import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

// Hàm format địa chỉ
const formatAddress = (order) => {
    return `${order.note || ''}, ${order.ward}, ${order.district}, ${order.city}`;
};

const ClusterDetailDialog = ({ open, onClose, clusterName, clusterOrders = [] }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
                Chi tiết Cụm: 
                <Typography component="span" variant="h6" color="primary" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {clusterName}
                </Typography>
            </DialogTitle>
            
            <DialogContent dividers sx={{ bgcolor: '#f9f9f9' }}>
                <Typography variant="h6" gutterBottom>
                    Tổng số: {clusterOrders.length} đơn hàng
                </Typography>
                
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                            <TableRow>
                                <TableCell>Mã Đơn Hàng</TableCell>
                                <TableCell>Người Nhận</TableCell>
                                <TableCell>Địa Chỉ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clusterOrders.map((order) => (
                                <TableRow key={order.orderId}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {order.orderId ? `${order.orderId.substring(0, 8)}...` : 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{order.recipientName || 'N/A'}</TableCell>
                                    <TableCell>{formatAddress(order)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <DialogActions sx={{ borderTop: '1px solid #e0e0e0', bgcolor: 'white', p: 2 }}>
                <Button onClick={onClose} color="primary" variant="contained">
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClusterDetailDialog;