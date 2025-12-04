import React from 'react';
import { Box, Typography, Divider, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const VoucherDetail = ({ voucher, onEdit, onDelete, onClose }) => {
  if (!voucher) return null;

  return (
    <Box width="800px" p={3} display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Chi tiết Voucher</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      <Divider />

      <Box mt={2}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          {[
            { label: 'ID', value: voucher.id },
            { label: 'Mã', value: voucher.code },
            { label: 'Loại', value: voucher.voucherType },
            { label: 'Phần trăm giảm', value: voucher.percentageDiscount ?? 'N/A' },
            { label: 'Giá trị giảm', value: voucher.valueDiscount ?? 'N/A' },
            { label: 'Giảm tối đa', value: voucher.highestDiscountValue ?? 'N/A' },
            { label: 'Giá trị đơn tối thiểu', value: voucher.minOrderValue ?? 'N/A' },
            { label: 'Giới hạn sử dụng', value: voucher.usageLimit ?? 'N/A' },
            { label: 'Giới hạn mỗi người', value: voucher.userUsageLimit ?? 'N/A' },
            { label: 'Công khai', value: voucher.publish ? 'Có' : 'Không' },
            { label: 'Ngày bắt đầu', value: voucher.startDate ? new Date(voucher.startDate).toLocaleDateString('vi-VN') : 'N/A' },
            { label: 'Ngày kết thúc', value: voucher.endDate ? new Date(voucher.endDate).toLocaleDateString('vi-VN') : 'N/A' },
          ].map((item, index) => (
            <Box key={index}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '12px', mb: '4px' }}>
                {item.label}:
              </Typography>
              <textarea
                value={item.value}
                readOnly
                style={{
                  width: '100%',
                  minHeight: '30px',
                  padding: '2px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: '#f9f9f9',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box mt={3} display="flex" gap={2} p={2}>
        <Button variant="contained" color="primary" onClick={onEdit} fullWidth>Sửa Voucher</Button>
        <Button variant="contained" color="error" onClick={onDelete} fullWidth>Xóa Voucher</Button>
      </Box>
    </Box>
  );
};

export default VoucherDetail;
