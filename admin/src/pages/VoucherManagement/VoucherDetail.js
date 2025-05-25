import React from "react";
import { Box, Typography, Divider, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const VoucherDetail = ({ selectedVoucher, onUpdate, onDelete, onClose }) => {
    if (!selectedVoucher) return null;

    return (
        <Box width="800px" p={3} role="presentation" display="flex" flexDirection="column" sx={{ paddingTop: 1 }}>
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
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}> {/* Sử dụng grid để bố cục */}
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            ID:
                        </Typography>
                        <textarea
                            value={selectedVoucher.id}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            Code:
                        </Typography>
                        <textarea
                            value={selectedVoucher.code}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            Type:
                        </Typography>
                        <textarea
                            value={selectedVoucher.voucherType}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            Percentage Discount:
                        </Typography>
                        <textarea
                            value={selectedVoucher.percentageDiscount}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            Value Discount:
                        </Typography>
                        <textarea
                            value={selectedVoucher.valueDiscount}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            Highest Discount Value:
                        </Typography>
                        <textarea
                            value={selectedVoucher.highestDiscountValue}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            Min Order Value:
                        </Typography>
                        <textarea
                            value={selectedVoucher.minOrderValue}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            Usage Limit:
                        </Typography>
                        <textarea
                            value={selectedVoucher.usageLimit}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            Start Date:
                        </Typography>
                        <textarea
                            value={new Date(selectedVoucher.startDate).toLocaleDateString()}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                            End Date:
                        </Typography>
                        <textarea
                            value={new Date(selectedVoucher.endDate).toLocaleDateString()}
                            readOnly
                            style={{
                                width: "100%", minHeight: "30px", padding: "2px", border: "1px solid #ddd",
                                borderRadius: "6px", fontSize: "14px", backgroundColor: "#f9f9f9", resize: "vertical",
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Action Buttons */}
            <Box mt={3} display="flex" gap={2} p={2}>
                <Button variant="contained" color="primary" onClick={onUpdate} fullWidth>
                    Sửa Voucher
                </Button>
                <Button variant="contained" color="error" onClick={onDelete} fullWidth>
                    Xóa Voucher
                </Button>
            </Box>
        </Box>
    );
};

export default VoucherDetail;