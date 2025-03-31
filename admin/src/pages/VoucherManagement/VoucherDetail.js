import React from "react";
import { Box, Typography, Divider, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const VoucherDetail = ({ selectedVoucher, onUpdate, onDelete, onClose }) => {
  if (!selectedVoucher) return null;

  return (
    <Box style={{ maxHeight: '90vh', overflowY: 'auto' }}>
      {/* Header with Title and Close Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Voucher Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {/* Voucher Fields */}
      <Box mt={2}>
        <Typography>
          <strong>ID:</strong> {selectedVoucher.id}
        </Typography>
        <Typography>
          <strong>Code:</strong> {selectedVoucher.code}
        </Typography>
        <Typography>
          <strong>Type:</strong> {selectedVoucher.voucherType}
        </Typography>
        <Typography>
          <strong>Percentage Discount:</strong> {selectedVoucher.percentageDiscount}%
        </Typography>
        <Typography>
          <strong>Value Discount:</strong> {selectedVoucher.valueDiscount}
        </Typography>
        <Typography>
          <strong>Highest Discount Value:</strong> {selectedVoucher.highestDiscountValue}
        </Typography>
        <Typography>
          <strong>Min Order Value:</strong> {selectedVoucher.minOrderValue}
        </Typography>
        <Typography>
          <strong>Usage Limit:</strong> {selectedVoucher.usageLimit}
        </Typography>
        <Typography>
          <strong>Start Date:</strong>{" "}
          {new Date(selectedVoucher.startDate).toLocaleDateString()}
        </Typography>
        <Typography>
          <strong>End Date:</strong>{" "}
          {new Date(selectedVoucher.endDate).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button variant="contained" color="primary" onClick={onUpdate}>
          Update
        </Button>
        <Button variant="contained" color="error" onClick={onDelete}>
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default VoucherDetail;