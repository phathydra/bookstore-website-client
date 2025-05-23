import React, { useState } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import UpdateInformation from './UpdateInformation';

// Ảnh avatar mặc định (bạn có thể thay đổi URL này hoặc import ảnh từ local)
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

const InformationDetail = ({ selectedInformation, handleOpenUpdateModal }) => {
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
                src={selectedInformation.avatar || DEFAULT_AVATAR}
                alt={selectedInformation.name || 'No Name'}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  marginBottom: '10px'
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                {selectedInformation.name?.trim() || 'No Name'}
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
                    value={item.value || ''}
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

          {/* Chỉ còn nút Sửa */}
          <Box width="100%" display="flex" gap={1} p={2}>
            <Button variant="contained" color="primary" onClick={handleOpenUpdateModalClick} fullWidth>
              Sửa
            </Button>
          </Box>

          {/* Modal cập nhật */}
          {openUpdateModal && (
            <UpdateInformation
              information={selectedInformation}
              onUpdate={() => {
                // Optional callback
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
