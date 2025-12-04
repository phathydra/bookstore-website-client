// src/pages/DeliveryUnitDashboard/component/NearbyShipperDialog.jsx
import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemAvatar, Avatar,
    ListItemText, Typography, Box, Chip
} from '@mui/material';
// Giả sử bạn có các icon này trong file Icons.js
import { IconUser, IconPhone, IconLocation } from './Icons'; 

const NearbyShipperDialog = ({ open, onClose, shippers = [] }) => {
    
    // Backend (findByCurrentLocationNear) đã tự động sắp xếp
    // nên chúng ta chỉ cần hiển thị
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <IconLocation className="h-6 w-6 text-blue-500" />
                    <Typography variant="h6" component="div">
                        Đã tìm thấy {shippers.length} Shipper lân cận
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <List sx={{ width: '100%' }}>
                    {shippers.map((shipper) => (
                        <ListItem key={shipper.shipperId} divider>
                            <ListItemAvatar>
                                <Avatar 
                                    src={shipper.avatar !== 'null' ? shipper.avatar : undefined}
                                    sx={{ bgcolor: shipper.avatar === 'null' ? 'primary.main' : undefined }}
                                >
                                    <IconUser />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="body1" fontWeight="500">
                                        {shipper.name !== 'null' ? shipper.name : (shipper.email || shipper.shipperId)}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                            <IconPhone className="h-4 w-4 text-gray-500" />
                                            <Typography variant="body2" color="textSecondary">
                                                {shipper.phone !== 'null' ? shipper.phone : 'Chưa có SĐT'}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1} mt={1} flexWrap="wrap">
                                            <Chip 
                                                icon={<IconLocation className="h-4 w-4" />} 
                                                label={`Lon: ${shipper.longitude?.toFixed(4)}, Lat: ${shipper.latitude?.toFixed(4)}`}
                                                color="info"
                                                variant="outlined"
                                                size="small"
                                            />
                                            {shipper.lastUpdated && (
                                                <Typography variant="caption" color="textSecondary">
                                                    (Cập nhật: {new Date(shipper.lastUpdated).toLocaleTimeString('vi-VN')})
                                                </Typography>
                                            )}
                                        </Box>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
                {shippers.length === 0 && (
                     <Typography variant="body1" align="center" sx={{ p: 3, color: 'text.secondary' }}>
                        (Danh sách trống)
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" variant="contained">
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NearbyShipperDialog;