import React from 'react';
import { Box, Typography, Divider, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DiscountDetail = ({ selectedDiscount, handleOpenUpdateModal, handleDeleteDiscount, onClose }) => {
    return (
        <Box width="360px" p={2} display="flex" flexDirection="column" sx={{ paddingTop: 1 }}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            {selectedDiscount && (
                <>
                    <Box display="flex" mb={3} p={2} sx={{ border: "1px solid #ddd", borderRadius: "8px" }}>
                        <Box sx={{ width: "100%", p: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
                                Discount Details
                            </Typography>
                            <Divider sx={{ width: "100%", mb: 2 }} />
                            <Box display="grid" gridTemplateColumns="1fr" gap={2}>
                                {[
                                    { label: "ID", value: selectedDiscount.id },
                                    { label: "Percentage", value: `${selectedDiscount.percentage}%` },
                                    { label: "Start Date", value: new Date(selectedDiscount.startDate).toLocaleDateString() },
                                    { label: "End Date", value: new Date(selectedDiscount.endDate).toLocaleDateString() },
                                ].map((item, index) => (
                                    <Box key={index} sx={{ width: "100%" }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                                            {item.label}:
                                        </Typography>
                                        <textarea
                                            value={item.value}
                                            readOnly
                                            style={{
                                                width: "100%",
                                                minHeight: "30px",
                                                padding: "2px",
                                                border: "1px solid #ddd",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                                backgroundColor: "#f9f9f9",
                                                resize: "vertical",
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mt={3} gap={2} p={2}>
                        <Button variant="contained" color="primary" onClick={handleOpenUpdateModal} fullWidth sx={{ mr: 1 }}>
                            Sửa mã giảm giá
                        </Button>
                        <Button variant="contained" color="error" onClick={() => handleDeleteDiscount(selectedDiscount.id)} fullWidth>
                            Xóa mã giảm giá
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default DiscountDetail;