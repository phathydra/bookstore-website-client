import React from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';

const DiscountDetail = ({ selectedDiscount, handleOpenUpdateModal, handleDeleteDiscount }) => {
  return (
    <Box width="400px" p={3} display="flex" flexDirection="column">
      {selectedDiscount && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
            Discount Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="grid" gridTemplateColumns="1fr" gap={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>ID:</Typography>
              <Typography>{selectedDiscount.id}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Percentage:</Typography>
              <Typography>{selectedDiscount.percentage}%</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Start Date:</Typography>
              <Typography>{new Date(selectedDiscount.startDate).toLocaleDateString()}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>End Date:</Typography>
              <Typography>{new Date(selectedDiscount.endDate).toLocaleDateString()}</Typography>
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button variant="contained" color="primary" onClick={handleOpenUpdateModal} fullWidth sx={{ mr: 1 }}>
              Update
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteDiscount} fullWidth>
              Delete
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DiscountDetail;