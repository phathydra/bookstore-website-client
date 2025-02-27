import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box, Drawer
} from '@mui/material';
import AddInformation from './AddInformation';
import UpdateInformation from './UpdateInformation';
import InformationDetail from './InformationDetail';

const InformationManagement = () => {
  const [information, setInformation] = useState([]);
  const [selectedInformation, setSelectedInformation] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchInformation();
  }, []);

  const fetchInformation = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/account/allInformation');
      setInformation(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông tin:', error);
    }
  };

  const handleSelectInformation = (info) => {
    setSelectedInformation(info);
    setIsDrawerOpen(true);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
    setIsDrawerOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setIsDrawerOpen(true);
  };

  const handleAddInformation = (newInformation) => {
    setInformation([...information, { ...newInformation, id: `${information.length + 1}` }]);
  };

  const handleUpdateInformation = (updatedInformation) => {
    setInformation(information.map(info => info.id === selectedInformation.id ? { ...updatedInformation, id: selectedInformation.id } : info));
    setSelectedInformation(null);
    setIsUpdateModalOpen(false);
  };

  const handleDeleteInformation = () => {
    setInformation(information.filter(info => info.id !== selectedInformation.id));
    setSelectedInformation(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedInformation = information.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="flex h-screen">
      <div className="w-1/6 bg-white shadow-md z-50 fixed h-full">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex flex-col" style={{ paddingLeft: '14.5%' }}>
        <Header title="Information Management" />

        <div className="p-10 pt-20 flex w-full overflow-x-auto" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto">
            <Box className="flex justify-between mb-2">
              <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Danh sách thông tin
              </Typography>
              <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={handleOpenAddModal}>
                Thêm
              </Button>
            </Box>

            <TableContainer component={Paper} style={{ maxHeight: '70vh', overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Account ID</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Địa chỉ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedInformation.map((info) => (
                    <TableRow key={info.id} onClick={() => handleSelectInformation(info)} hover>
                      <TableCell>{info.id}</TableCell>
                      <TableCell>{info.accountId}</TableCell>
                      <TableCell>{info.name}</TableCell>
                      <TableCell>{info.email}</TableCell>
                      <TableCell>{info.phone}</TableCell>
                      <TableCell>{info.address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={information.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </div>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{
            width: 400,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 500,
              boxSizing: 'border-box',
            },
          }}
        >
          <InformationDetail
            selectedInformation={selectedInformation}
            handleOpenUpdateModal={handleOpenUpdateModal}
          />
        </Drawer>

        {isAddModalOpen && <AddInformation onClose={handleCloseAddModal} />}
        {isUpdateModalOpen && <UpdateInformation
          selectedInformation={selectedInformation}
          onUpdate={handleUpdateInformation}
          onClose={handleCloseUpdateModal}
        />}
      </main>
    </div>
  );
};

export default InformationManagement;
