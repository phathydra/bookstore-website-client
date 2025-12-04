import React from "react";
import { Box, Typography, Divider, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const RankVoucherDetail = ({ voucher, onEdit, onDelete, onClose }) => {
  if (!voucher) return null;

  return (
    <Box width="800px" p={3} role="presentation" display="flex" flexDirection="column" sx={{ paddingTop: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Rank Voucher Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box mt={2}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>

          {/* ID */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
              ID:
            </Typography>
            <textarea
              value={voucher.id}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
              }}
            />
          </Box>

          {/* CODE */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
              Code:
            </Typography>
            <textarea
              value={voucher.code}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
              }}
            />
          </Box>

          {/* RANK */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
              Rank yêu cầu:
            </Typography>
            <textarea
              value={voucher.requiredRank}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
              }}
            />
          </Box>

          {/* START DATE */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
              Ngày bắt đầu:
            </Typography>
            <textarea
              value={new Date(voucher.startDate).toLocaleString("vi-VN")}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
              }}
            />
          </Box>

          {/* END DATE */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
              Ngày kết thúc:
            </Typography>
            <textarea
              value={new Date(voucher.endDate).toLocaleString("vi-VN")}
              readOnly
              style={{
                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
              }}
            />
          </Box>

        </Box>
      </Box>

      {/* ACTION BUTTONS */}
      <Box mt={3} display="flex" gap={2} p={2}>
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

export default RankVoucherDetail;
