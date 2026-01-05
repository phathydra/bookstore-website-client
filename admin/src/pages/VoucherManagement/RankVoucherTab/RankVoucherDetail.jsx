import React from "react";
import { Box, Typography, Divider, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const RankVoucherDetail = ({ voucher, onEdit, onDelete, onClose }) => {
  if (!voucher) return null;

  return (
    <Box role="presentation" display="flex" flexDirection="column" sx={{ height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Rank Voucher Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      
      <Box mt={2} flex={1} overflow="auto">
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>

          {/* ID */}
          <FieldView label="ID" value={voucher.id} />
          
          {/* CODE */}
          <FieldView label="Code" value={voucher.code} />
          
          {/* RANK */}
          <FieldView label="Rank yêu cầu" value={voucher.requiredRank || voucher.rank} />
          
          {/* LOẠI */}
          <FieldView label="Loại Voucher" value={voucher.voucherType} />

          {/* GIÁ TRỊ GIẢM */}
          <FieldView label="Phần trăm giảm" value={voucher.percentageDiscount} />
          <FieldView label="Giảm theo tiền" value={voucher.valueDiscount} />
          
          {/* DATE */}
          <FieldView label="Ngày bắt đầu" value={voucher.startDate ? new Date(voucher.startDate).toLocaleDateString("vi-VN") : "-"} />
          <FieldView label="Ngày kết thúc" value={voucher.endDate ? new Date(voucher.endDate).toLocaleDateString("vi-VN") : "-"} />

        </Box>
      </Box>

      {/* ACTION BUTTONS */}
      <Box mt={3} display="flex" gap={2} pt={2} borderTop="1px solid #eee">
        <Button variant="contained" color="primary" onClick={onEdit} fullWidth>
          Sửa Rank Voucher
        </Button>
        <Button variant="contained" color="error" onClick={() => onDelete(voucher.id)} fullWidth>
          Xóa Rank Voucher
        </Button>
      </Box>
    </Box>
  );
};

// Component con để hiển thị từng trường cho gọn
const FieldView = ({ label, value }) => (
    <Box sx={{ width: "100%" }}>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", mb: "4px" }}>
        {label}:
    </Typography>
    <Box
        sx={{
        width: "100%", minHeight: "35px", padding: "8px",
        border: "1px solid #ddd", borderRadius: "6px",
        fontSize: "14px", backgroundColor: "#f9f9f9",
        wordBreak: "break-all"
        }}
    >
        {value === null || value === undefined || value === '' ? '—' : value}
    </Box>
    </Box>
);

export default RankVoucherDetail;