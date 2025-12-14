import React from 'react';
import { Box, Typography, Divider, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DiscountDetail = ({ selectedDiscount, handleOpenUpdateModal, handleDeleteDiscount, onClose }) => {
    
    // Format ngày giờ hiển thị đẹp mắt (VD: 12/11/2025, 10:00:00 SA)
    const formatDisplayDate = (dateString, type) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Dùng định dạng 24h cho dễ nhìn
        };

        // Nếu là Normal chỉ cần hiện ngày cho gọn, Flash Sale hiện cả giờ
        if (type === 'NORMAL') {
             return date.toLocaleDateString('vi-VN'); 
        }
        return date.toLocaleString('vi-VN', options);
    };

    if (!selectedDiscount) return null;

    return (
        <Box width="360px" p={2} display="flex" flexDirection="column" sx={{ paddingTop: 1 }}>
            <Box display="flex" justifyContent="flex-end" mb={1}>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box display="flex" flexDirection="column" gap={2} p={2} sx={{ border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', color: '#1976d2' }}>
                    CHI TIẾT MÃ GIẢM GIÁ
                </Typography>
                <Divider />

                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    {/* Render từng dòng thông tin */}
                    <DetailItem 
                        label="Mã ID" 
                        value={selectedDiscount.id} 
                        copyable 
                    />
                    
                    <DetailItem 
                        label="Loại chương trình" 
                        value={selectedDiscount.type === 'FLASH_SALE' ? '⚡ FLASH SALE' : '🏷️ Giảm giá thường'} 
                        highlight={selectedDiscount.type === 'FLASH_SALE'}
                    />

                    <DetailItem 
                        label="Mức giảm giá" 
                        value={`${selectedDiscount.percentage}%`} 
                        bold
                    />

                    <DetailItem 
                        label="Bắt đầu" 
                        value={formatDisplayDate(selectedDiscount.startDate, selectedDiscount.type)} 
                    />

                    <DetailItem 
                        label="Kết thúc" 
                        value={formatDisplayDate(selectedDiscount.endDate, selectedDiscount.type)} 
                        color="red"
                    />
                </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={1.5} mt={3}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleOpenUpdateModal} 
                    fullWidth 
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                    Chỉnh sửa thông tin
                </Button>
                <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => handleDeleteDiscount(selectedDiscount.id)} 
                    fullWidth
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                    Xóa mã giảm giá
                </Button>
            </Box>
        </Box>
    );
};

// Component con để hiển thị từng dòng cho gọn code
const DetailItem = ({ label, value, highlight, bold, color, copyable }) => (
    <Box>
        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
        </Typography>
        <Box 
            sx={{ 
                backgroundColor: highlight ? '#fff3e0' : '#f8f9fa', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: highlight ? '1px solid #ffcc80' : '1px solid #eee',
                marginTop: '4px',
                wordBreak: 'break-all'
            }}
        >
            <Typography 
                variant="body2" 
                sx={{ 
                    fontWeight: bold ? 'bold' : 'normal', 
                    color: color || (highlight ? '#e65100' : '#333'),
                    fontFamily: copyable ? 'monospace' : 'inherit'
                }}
            >
                {value}
            </Typography>
        </Box>
    </Box>
);

export default DiscountDetail;