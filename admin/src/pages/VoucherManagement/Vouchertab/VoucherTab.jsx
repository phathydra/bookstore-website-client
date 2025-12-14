import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  TablePagination, Button, Box, IconButton, TextField, InputAdornment, Drawer,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Search } from '@mui/icons-material';

import AddVoucher from './AddVoucher';
import UpdateVoucher from './UpdateVoucher';
import VoucherDetail from './VoucherDetail';

const VoucherTab = () => {
  const [vouchers, setVouchers] = useState({ content: [], totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = 'http://localhost:8082/api/vouchers';
      const params = {
        page,
        size: rowsPerPage,
      };

      if (status === 'ACTIVE') url += '/active';
      else if (status === 'EXPIRED') url += '/expired';
      else if (status === 'UPCOMING') url += '/upcoming';

      if (searchTerm && status === 'ALL') {
        params.code = searchTerm.trim();
      }

      const res = await axios.get(url, { params });
      setVouchers(res.data || { content: [], totalElements: 0 });
    } catch (err) {
      setError('Không thể tải danh sách voucher');
      setVouchers({ content: [], totalElements: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, status, searchTerm]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, status]);

  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setIsDetailDrawerOpen(true);
  };

  const handleDeleteVoucher = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa voucher này không?')) return;

    try {
      await axios.delete(`http://localhost:8082/api/vouchers/${id}`);
      setIsDetailDrawerOpen(false);
      setSelectedVoucher(null);
      fetchVouchers();
    } catch (err) {
      setError('Xóa voucher thất bại');
    }
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <TextField
            label="Tìm theo mã voucher"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '50%', backgroundColor: 'white', borderRadius: '8px' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Trạng thái">
              <MenuItem value="ALL">ALL</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="EXPIRED">EXPIRED</MenuItem>
              <MenuItem value="UPCOMING">UPCOMING</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            sx={{ bgcolor: 'green', '&:hover': { bgcolor: 'darkgreen' } }}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add
          </Button>
        </Box>
      </Box>

      {/* Error */}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: '65vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Mã Voucher</strong></TableCell>
              <TableCell><strong>Loại</strong></TableCell>
              <TableCell><strong>Ngày bắt đầu</strong></TableCell>
              <TableCell><strong>Ngày kết thúc</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Đang tải...</TableCell>
              </TableRow>
            ) : vouchers.content?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Không có dữ liệu</TableCell>
              </TableRow>
            ) : (
              vouchers.content.map((v) => (
                <TableRow key={v.id} hover onClick={() => handleSelectVoucher(v)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{v.id}</TableCell>
                  <TableCell>{v.code}</TableCell>
                  <TableCell>{v.voucherType}</TableCell>
                  <TableCell>{new Date(v.startDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{new Date(v.endDate).toLocaleDateString('vi-VN')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={vouchers.totalElements || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Số dòng mỗi trang:"
      />

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddVoucher
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchVouchers}
        />
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <UpdateVoucher
          open={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          voucher={selectedVoucher}
          onSuccess={fetchVouchers}
        />
      )}

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 800 },
            p: 3,
          },
        }}
      >
        {selectedVoucher && (
          <VoucherDetail
            voucher={selectedVoucher}
            onClose={() => setIsDetailDrawerOpen(false)}
            onEdit={() => {
              setIsUpdateModalOpen(true);
              setIsDetailDrawerOpen(false);
            }}
            onDelete={() => handleDeleteVoucher(selectedVoucher.id)}
          />
        )}
      </Drawer>
    </Box>
  );
};

export default VoucherTab;