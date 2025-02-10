import React, { useState } from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header'; 
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Chip, Button, Box, Card, CardContent, Avatar, Divider
} from '@mui/material';
import AddInformation from './AddInformation';
import UpdateInformation from './UpdateInformation';

const InformationManagement = () => {
  const [information, setInformation] = useState([
    {
      _id: '1',
      name: 'John Doe',
      gender: 'Male',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '123 Main St, City, Country',
      avatar: 'https://via.placeholder.com/150',
      isActive: true,
    },
    {
      _id: '2',
      name: 'Jane Doe',
      gender: 'Female',
      email: 'jane@example.com',
      phone: '098-765-4321',
      address: '456 Elm St, City, Country',
      avatar: 'https://via.placeholder.com/150',
      isActive: false,
    },
  ]);

  const [selectedInformation, setSelectedInformation] = useState(null); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleSelectInformation = (info) => {
    setSelectedInformation(info);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleAddInformation = (newInformation) => {
    setInformation([...information, { ...newInformation, _id: `${information.length + 1}` }]);
  };

  const handleUpdateInformation = (updatedInformation) => {
    setInformation(information.map(info => info._id === selectedInformation._id ? { ...updatedInformation, _id: selectedInformation._id } : info));
    setSelectedInformation(null);
  };

  const handleDeleteInformation = () => {
    setInformation(information.filter(info => info._id !== selectedInformation._id));
    setSelectedInformation(null);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-white shadow-md z-50">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex">
        <Header title="Information Management" />

        <div className="p-4 pt-20 flex w-full" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto" style={{ marginBottom: 'auto', height: 'calc(100vh - 5rem)' }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
              Bảng danh sách thông tin
            </Typography>

            <TableContainer component={Paper} style={{ height: '90%', position: 'relative' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Tên</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>Giới tính</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 160 }}>Địa chỉ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>Avatar</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {information.map((info) => (
                    <TableRow key={info._id} onClick={() => handleSelectInformation(info)} hover>
                      <TableCell>{info._id}</TableCell>
                      <TableCell>{info.name}</TableCell>
                      <TableCell>{info.gender}</TableCell>
                      <TableCell>{info.email}</TableCell>
                      <TableCell>{info.phone}</TableCell>
                      <TableCell>{info.address}</TableCell>
                      <TableCell>
                        <Avatar src={info.avatar} alt={info.name} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={info.isActive ? 'Active' : 'Inactive'}
                          color={info.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={information.length}
              rowsPerPage={5}
              page={0}
            />
          </Box>

          <Box className="w-1/4 p-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg flex flex-col justify-between" style={{ height: 'calc(100vh - 6rem)' }}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar sx={{ width: 64, height: 64, mb: 2, bgcolor: 'primary.main' }}>
                    {selectedInformation ? selectedInformation.name.charAt(0).toUpperCase() : ''}
                  </Avatar>
                  {selectedInformation ? (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {selectedInformation.name}
                      </Typography>
                      <Divider sx={{ width: '100%', mb: 2 }} />
                      <Box width="100%">
                        <Typography variant="body2" color="textSecondary" component="p">
                          <strong>ID:</strong> {selectedInformation._id}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          <strong>Giới tính:</strong> {selectedInformation.gender}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          <strong>Email:</strong> {selectedInformation.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          <strong>Phone:</strong> {selectedInformation.phone}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          <strong>Địa chỉ:</strong> {selectedInformation.address}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                      Chọn một thông tin để xem chi tiết
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Box className="flex justify-center space-x-4" style={{ marginTop: 'auto', marginBottom: '10px' }}>
              <Button variant="contained" style={{ backgroundColor: 'green', color: 'white' }} onClick={handleOpenAddModal}>
                Thêm
              </Button>
              <Button variant="contained" color="primary" disabled={!selectedInformation} onClick={handleOpenUpdateModal}>
                Sửa
              </Button>
              <Button variant="contained" color="error" disabled={!selectedInformation} onClick={handleDeleteInformation}>
                Xóa
              </Button>
            </Box>
          </Box>
        </div>

        {isAddModalOpen && <AddInformation onAdd={handleAddInformation} onClose={handleCloseAddModal} />}
        {isUpdateModalOpen && selectedInformation && <UpdateInformation information={selectedInformation} onUpdate={handleUpdateInformation} onClose={handleCloseUpdateModal} />}
      </main>
    </div>
  );
};

export default InformationManagement;
