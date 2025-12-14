import React from "react";
import { Box, Typography, Divider, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ObtainableVoucherDetail = ({ voucher, onEdit, onDelete, onClose }) => {
  if (!voucher) return null;

  return (
    <Box width="800px" p={3} role="presentation" display="flex" flexDirection="column" sx={{ paddingTop: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Obtainable Voucher Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box mt={2}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>

          {/* ID */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", mb: "4px" }}>
              ID:
            </Typography>
            <textarea
              value={voucher.id}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px",
                border: "1px solid #ddd", borderRadius: "6px",
                fontSize: "14px", backgroundColor: "#f9f9f9"
              }}
            />
          </Box>

          {/* Code */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", mb: "4px" }}>
              Code:
            </Typography>
            <textarea
              value={voucher.code}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px",
                border: "1px solid #ddd", borderRadius: "6px",
                fontSize: "14px", backgroundColor: "#f9f9f9"
              }}
            />
          </Box>

          {/* Public Claimable */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", mb: "4px" }}>
              Public Claimable:
            </Typography>
            <textarea
              value={voucher.publicClaimable ? "Yes" : "No"}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px",
                border: "1px solid #ddd", borderRadius: "6px",
                fontSize: "14px", backgroundColor: "#f9f9f9"
              }}
            />
          </Box>

          {/* Value Requirement */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", mb: "4px" }}>
              Value Requirement:
            </Typography>
            <textarea
              value={voucher.valueRequirement || ""}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px",
                border: "1px solid #ddd", borderRadius: "6px",
                fontSize: "14px", backgroundColor: "#f9f9f9"
              }}
            />
          </Box>

          {/* Start Date */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", mb: "4px" }}>
              Start Date:
            </Typography>
            <textarea
              value={voucher.startDate ? new Date(voucher.startDate).toLocaleDateString("vi-VN") : "—"}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px",
                border: "1px solid #ddd", borderRadius: "6px",
                fontSize: "14px", backgroundColor: "#f9f9f9"
              }}
            />
          </Box>

          {/* End Date */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", mb: "4px" }}>
              End Date:
            </Typography>
            <textarea
              value={voucher.endDate ? new Date(voucher.endDate).toLocaleDateString("vi-VN") : "—"}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px",
                border: "1px solid #ddd", borderRadius: "6px",
                fontSize: "14px", backgroundColor: "#f9f9f9"
              }}
            />
          </Box>

        </Box>
      </Box>

      {/* Buttons */}
      <Box mt={3} display="flex" gap={2} p={2}>
        <Button variant="contained" color="primary" onClick={onEdit} fullWidth>
          Sửa Obtainable Voucher
        </Button>
        <Button variant="contained" color="error" onClick={onDelete} fullWidth>
          Xóa Obtainable Voucher
        </Button>
      </Box>
    </Box>
  );
};

export default ObtainableVoucherDetail;
