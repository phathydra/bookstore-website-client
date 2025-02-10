import React, { useState, useEffect } from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header'; 
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Chip, Button, Box, Card, CardContent, Avatar, Divider
} from '@mui/material';
import AddAccount from './AddAccount';
import UpdateAccount from './UpdateAccount';

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([
    {
      _id: '1',
      username: 'JohnDoe',
      email: 'john@example.com',
      role: 'Admin',
      isActive: true,
    },
    {
      _id: '2',
      username: 'JaneDoe',
      email: 'jane@example.com',
      role: 'User',
      isActive: false,
    },
  ]);

  const [selectedAccount, setSelectedAccount] = useState(null); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
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

  const handleAddAccount = (newAccount) => {
    setAccounts([...accounts, { ...newAccount, _id: `${accounts.length + 1}` }]);
  };

  const handleUpdateAccount = (updatedAccount) => {
    setAccounts(accounts.map(account => account._id === selectedAccount._id ? { ...updatedAccount, _id: selectedAccount._id } : account));
    setSelectedAccount(null);
  };

  const handleDeleteAccount = () => {
    setAccounts(accounts.filter(account => account._id !== selectedAccount._id));
    setSelectedAccount(null);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-white shadow-md z-50">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex">
        <Header title="Account Management" />

        <div className="p-10 pt-20 flex w-full" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto" style={{ marginBottom: 'auto', height: 'calc(100vh - 5rem)' }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
              Bảng danh sách tài khoản
            </Typography>

            <TableContainer component={Paper} style={{ height: '90%', position: 'relative' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Tên</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Quyền</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account._id} onClick={() => handleSelectAccount(account)} hover>
                      <TableCell>{account._id}</TableCell>
                      <TableCell>{account.username}</TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>{account.role}</TableCell>
                      <TableCell>
                        <Chip
                          label={account.isActive ? 'Active' : 'Inactive'}
                          color={account.isActive ? 'success' : 'error'}
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
              count={accounts.length}
              rowsPerPage={10}
              page={0}
            />
          </Box>

          <Box className="w-1/3 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg flex flex-col justify-between" style={{ height: 'calc(100vh - 6rem)' }}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar sx={{ width: 64, height: 64, mb: 2, bgcolor: 'primary.main' }}>
                    {selectedAccount ? selectedAccount.username.charAt(0).toUpperCase() : ''}
                  </Avatar>
                  {selectedAccount ? (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {selectedAccount.username}
                      </Typography>
                      <Divider sx={{ width: '100%', mb: 2 }} />
                      <Box width="100%">
                        <Typography variant="body2" color="textSecondary" component="p">
                          <strong>ID:</strong> {selectedAccount._id}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          <strong>Email:</strong> {selectedAccount.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          <strong>Quyền:</strong> {selectedAccount.role}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          <strong>Trạng thái:</strong> {selectedAccount.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                      Chọn một tài khoản để xem chi tiết
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Box className="flex justify-center space-x-4" style={{ marginTop: 'auto', marginBottom: '10px' }}>
              <Button variant="contained" style={{ backgroundColor: 'green', color: 'white' }} onClick={handleOpenAddModal}>
                Thêm
              </Button>
              <Button variant="contained" color="primary" disabled={!selectedAccount} onClick={handleOpenUpdateModal}>
                Sửa
              </Button>
              <Button variant="contained" color="error" disabled={!selectedAccount} onClick={handleDeleteAccount}>
                Xóa
              </Button>
            </Box>
          </Box>
        </div>

        {isAddModalOpen && <AddAccount onAdd={handleAddAccount} onClose={handleCloseAddModal} />}
        {isUpdateModalOpen && selectedAccount && <UpdateAccount account={selectedAccount} onUpdate={handleUpdateAccount} onClose={handleCloseUpdateModal} />}
      </main>
    </div>
  );
};

export default AccountManagement;
