import React, { useState } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import UpdateInformation from './UpdateInformation';

const InformationDetail = ({ selectedInformation, handleOpenUpdateModal, handleDeleteInformation }) => {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleOpenUpdateModalClick = () => {
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
  };

  return (
    <Box width="500px" p={2} role="presentation" display="flex" flexDirection="column" sx={{ paddingTop: 1 }}>
      {selectedInformation && (
        <>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2} p={2} sx={{ border: '1px solid #ddd', borderRadius: '8px' }}>
            {/* Avatar Image */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <img
                src={selectedInformation.avatar}
                alt={selectedInformation.name}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  marginBottom: '10px'
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                {selectedInformation.name}
              </Typography>
            </Box>
            <Divider sx={{ width: '100%', mb: 2 }} />
            {/* Information details */}
            <Box display="grid" gridTemplateColumns="1fr" gap={1} sx={{ width: '100%' }}>
            {[
              { label: "ID", value: selectedInformation.id },
              { label: "Account ID", value: selectedInformation.accountId },
              { label: "Email", value: selectedInformation.email },
              { label: "Phone", value: selectedInformation.phone },
              { label: "Địa chỉ", value: selectedInformation.address },
            ].map((item, index) => (
              <Box key={index} sx={{ width: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
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
                    borderRadius: '3px',
                    fontSize: '13px',
                    backgroundColor: '#f9f9f9',
                    resize: 'vertical'
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Edit and Delete buttons */}
        <Box className="flex justify-between" width="100%" display="flex" gap={1} p={2}>
          <Button variant="contained" color="primary" onClick={handleOpenUpdateModalClick} fullWidth>
            Sửa
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteInformation} fullWidth>
            Xóa
          </Button>
        </Box>

        {/* UpdateInformation Modal */}
        {openUpdateModal && (
          <UpdateInformation
            information={selectedInformation}
            onUpdate={() => {
              // Do something after update, e.g. re-fetch the updated list
            }}
            onClose={handleCloseUpdateModal}
          />
        )}
      </>
    )}
  </Box>
);
};

export default InformationDetail;
