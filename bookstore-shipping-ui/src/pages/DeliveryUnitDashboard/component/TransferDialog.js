// src/pages/DeliveryUnitDashboard/component/TransferDialog.js
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemText, Radio, FormControlLabel
} from '@mui/material';

const TransferDialog = ({ open, onClose, onSubmit, otherUnits, selectedOrderCount }) => {
    const [selectedNewDeliveryUnitId, setSelectedNewDeliveryUnitId] = useState(null);

    // Reset lựa chọn khi dialog được mở
    useEffect(() => {
        if (open) {
            setSelectedNewDeliveryUnitId(null);
        }
    }, [open]);

    const handleSubmit = () => {
        if (selectedNewDeliveryUnitId) {
            onSubmit(selectedNewDeliveryUnitId);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Chuyển giao {selectedOrderCount} Đơn hàng</DialogTitle>
            <DialogContent dividers>
                {otherUnits.length > 0 ? (
                    <List>
                        {otherUnits.map((unit) => (
                            <ListItem key={unit.id} disablePadding>
                                <FormControlLabel
                                    value={unit.id}
                                    control={<Radio />}
                                    checked={selectedNewDeliveryUnitId === unit.id}
                                    onChange={() => setSelectedNewDeliveryUnitId(unit.id)}
                                    label={
                                        <ListItemText
                                            primary={unit.name}
                                            secondary={`SĐT: ${unit.phoneNumber}`}
                                        />
                                    }
                                    sx={{ width: '100%', m: 0, p: 1, '&:hover': { backgroundColor: '#f9fafb' }, borderRadius: 1 }}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <p className="text-gray-500">Không tìm thấy đơn vị vận chuyển nào khác để chuyển giao.</p>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Hủy</Button>
                <Button
                    onClick={handleSubmit}
                    color="warning"
                    variant="contained"
                    disabled={!selectedNewDeliveryUnitId}
                >
                    Xác nhận Chuyển giao ({selectedOrderCount} đơn)
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransferDialog;