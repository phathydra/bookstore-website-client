import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box, Drawer
} from '@mui/material';
import AddAccount from './AddAccount';
import AccountDetail from './AccountDetail';

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/account/allAccount');
      setAccounts(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tài khoản:', error);
    }
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
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

  // Xử lý xóa tài khoản
  const handleDeleteAccount = async (accountId) => {
    try {
      await axios.delete(`http://localhost:8080/api/account/delete?accountId=${accountId}`);
      setAccounts((prevAccounts) => prevAccounts.filter((acc) => acc.accountId !== accountId));
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Lỗi khi xóa tài khoản:', error);
    }
  };

  const displayedAccounts = accounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="flex h-screen">
      <div className="w-1/6 bg-white shadow-md z-50 fixed h-full">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex flex-col" style={{ paddingLeft: '14.5%' }}>
        <Header title="Account Management" />

        <div className="p-10 pt-20 flex w-full overflow-x-auto" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto">
            <Box className="flex justify-between mb-2">
              <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Danh sách tài khoản
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
                    <TableCell>Tên đăng nhập</TableCell>
                    <TableCell>Mật khẩu</TableCell>
                    <TableCell>Quyền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedAccounts.map((account) => (
                    <TableRow key={account.accountId} onClick={() => handleSelectAccount(account)} hover>
                      <TableCell>{account.accountId}</TableCell>
                      <TableCell>{account.username}</TableCell>
                      <TableCell>{account.password}</TableCell>
                      <TableCell>{account.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={accounts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
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
              width: 800,
              boxSizing: 'border-box',
            },
          }}
        >
          <AccountDetail
            selectedAccount={selectedAccount}
            handleOpenUpdateModal={handleOpenUpdateModal}
            handleDeleteAccount={handleDeleteAccount} // ✅ Truyền hàm xóa tài khoản vào
          />
        </Drawer>

        {isAddModalOpen && <AddAccount onAdd={fetchAccounts} onClose={handleCloseAddModal} />}
      </main>
    </div>
  );
};

export default AccountManagement;
