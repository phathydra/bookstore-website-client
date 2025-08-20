import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box, Drawer, TextField, InputAdornment, IconButton
} from '@mui/material';
import { Search, SaveAlt } from '@mui/icons-material';
import AddAccount from './AddAccount';
import AccountDetail from './AccountDetail';

const AccountManagement = () => {
  const [accounts, setAccounts] = useState({ content: [], totalElements: 0 });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, [page, rowsPerPage, searchTerm]);

  const fetchAccounts = async () => {
    try {
      let url = `http://localhost:8080/api/account/allAccount?page=${page}&size=${rowsPerPage}`;
      let response;
      if (searchTerm) {
        response = await axios.post(
          `http://localhost:8080/api/account/account_search?input=${searchTerm}&page=0&size=${rowsPerPage}`
        );
      } else {
        response = await axios.get(url);
      }
      setAccounts(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tài khoản:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset page to 0 when searching
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setIsDrawerOpen(true);
  };

  const handleToggleMenu = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      await axios.delete(`http://localhost:8080/api/account/${accountId}`);
      fetchAccounts();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

    // Hàm xử lý export
  const handleExportAccounts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/account/export_accounts",
        { responseType: "blob" } // nhận về blob để tải file
      );

      // Tạo link ảo để tải file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "accounts.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Lỗi khi export accounts:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <SideNav onToggleCollapse={handleToggleMenu} />

      <main
        className="flex-1 bg-gray-100 relative flex flex-col transition-all duration-300"
        style={{ paddingLeft: isCollapsed ? '5%' : '16.5%' }}
      >
        <Header
          title="QUẢN LÝ TÀI KHOẢN"
          isCollapsed={isCollapsed}
          className="sticky top-0 z-50 bg-white shadow-md"
        />

        {/* Thanh công cụ trên cùng */}
        <Box className="sticky top-[64px] z-30 bg-gray-100 shadow-md p-4 flex items-center border-b justify-between">
          <Box className="flex-1 flex justify-center">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              onChange={handleSearchChange}
              className="w-[50%]"
              sx={{ borderRadius: '8px', backgroundColor: 'white' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
                style: { borderRadius: '8px' },
              }}
            />
          </Box>

          <Box className="flex gap-2">
            {/* Nút export */}
            <Button
              variant="outlined"
              startIcon={<SaveAlt />}
              onClick={handleExportAccounts}
              style={{ borderColor: "green", color: "green" }}
            >
              Export
            </Button>

            {/* Nút thêm tài khoản */}
            <Button
              variant="contained"
              style={{ backgroundColor: 'green' }}
              onClick={() => setIsAddModalOpen(true)}
            >
              Thêm tài khoản
            </Button>
          </Box>
        </Box>

        <div className="flex-1 overflow-auto pt-[72px] px-2">
          <TableContainer
            component={Paper}
            style={{ maxHeight: '70vh', overflowX: 'auto' }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Mật khẩu</TableCell>
                  <TableCell align="center">Quyền</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts?.content?.map((account) => (
                  <TableRow
                    key={account.accountId}
                    onClick={() => handleSelectAccount(account)}
                    hover
                  >
                    <TableCell>{account.accountId}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell align="center">*******</TableCell>
                    <TableCell align="center">{account.role}</TableCell>
                    <TableCell align="center">
                      <span
                        style={{
                          backgroundColor: account.status === 'Active' ? '#4caf50' : '#f44336',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        {account.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="sticky bottom-0 bg-white shadow-md">
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={accounts?.totalElements || 0}
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
            handleDeleteAccount={handleDeleteAccount}
          />
        </Drawer>

        {isAddModalOpen && (
          <AddAccount
            onAdd={fetchAccounts}
            onClose={() => setIsAddModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default AccountManagement;