import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    RadioGroup, FormControlLabel, Radio, Typography, Box,
    CircularProgress, Alert
} from '@mui/material';
// Bạn cần đảm bảo đã tạo/export 2 icon này từ file Icons.js
import { IconUserSearch, IconUsers } from './Icons'; 

const ShipperAssignmentDialog = ({
    open,
    onClose,
    onSubmit,
    selectedOrderCount,
    // Props mới
    allShippers = [],       // Thêm giá trị mặc định = []
    nearbyShippers = null,  // Thêm giá trị mặc định = null
    isLoadingNearby,
    onFindNearby,
    onResetList
}) => {
    const [selectedShipperId, setSelectedShipperId] = useState('');

    // Quyết định danh sách nào sẽ được hiển thị
    // nearbyShippers = null -> Dùng list 'all'
    // nearbyShippers = [] -> Tìm ko thấy
    // nearbyShippers = [...] -> Tìm thấy
    const isNearbyListActive = nearbyShippers !== null;
    
    // Luôn gán giá trị mặc định để đảm bảo displayList là một array
    const displayList = isNearbyListActive ? (nearbyShippers || []) : (allShippers || []);

    // Reset lựa chọn khi dialog mở hoặc danh sách thay đổi
    useEffect(() => {
        if (open) {
            setSelectedShipperId('');
        }
    }, [open, isNearbyListActive]);

    const handleSubmit = () => {
        if (!selectedShipperId) {
            alert('Vui lòng chọn một shipper.');
            return;
        }
        onSubmit(selectedShipperId);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Gán Shipper cho {selectedOrderCount} đơn hàng
            </DialogTitle>
            <DialogContent dividers>
                {/* --- KHU VỰC TÌM KIẾM MỚI --- */}
                <Box display="flex" flexWrap="wrap" gap={2} mb={2} p={2} bgcolor="grey.50" borderRadius={2}>
                    <Button
                        variant="outlined"
                        color="info"
                        startIcon={isLoadingNearby ? <CircularProgress size={20} /> : <IconUserSearch className="h-5 w-5" />}
                        onClick={() => onFindNearby(5)} // Tìm bán kính 5km
                        disabled={isLoadingNearby}
                    >
                        {isLoadingNearby ? 'Đang tìm...' : 'Tìm shipper gần (5km)'}
                    </Button>
                    
                    {isNearbyListActive && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<IconUsers className="h-5 w-5" />} // Giả sử bạn có icon này
                            onClick={onResetList}
                            disabled={isLoadingNearby}
                        >
                            Hiện tất cả
                        </Button>
                    )}
                </Box>
                {/* ----------------------------- */}

                <Typography variant="h6" gutterBottom>
                    {isNearbyListActive ? `Shipper tìm thấy (${displayList.length})` : `Tất cả Shipper (${displayList.length})`}
                </Typography>

                {displayList.length === 0 ? (
                    <Alert severity={isNearbyListActive ? "info" : "warning"}>
                        {isNearbyListActive ? "Không tìm thấy shipper nào đang hoạt động gần đây." : "Không có shipper nào trong danh sách."}
                    </Alert>
                ) : (
                    <RadioGroup
                        value={selectedShipperId}
                        onChange={(e) => setSelectedShipperId(e.target.value)}
                    >
                        <Box sx={{ maxHeight: '40vh', overflowY: 'auto' }}>
                            {displayList.map((shipper) => (
                                <FormControlLabel
                                    key={shipper.id}
                                    value={shipper.id}
                                    control={<Radio />}
                                    label={
                                        <Box>
                                            <Typography variant="body1" fontWeight="500">
                                                {shipper.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                SĐT: {shipper.phoneNumber}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{
                                        borderBottom: '1px solid #eee',
                                        width: '100%',
                                        ml: 0,
                                        '&:last-child': { borderBottom: 'none' }
                                    }}
                                />
                            ))}
                        </Box>
                    </RadioGroup>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!selectedShipperId}
                >
                    Xác nhận gán
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShipperAssignmentDialog;