import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  TablePagination, Button, Box, TextField, InputAdornment, IconButton, Drawer,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Search } from '@mui/icons-material';

import AddRankVoucher from './AddRankVoucher';
import UpdateRankVoucher from './UpdateRankVoucher';
import RankVoucherDetail from './RankVoucherDetail';

const RankVoucherTab = () => {
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
      let url = 'http://localhost:8082/api/vouchers/rank';
      const params = { page, size: rowsPerPage };

      if (status === 'ACTIVE') url += '/active';
      else if (status === 'EXPIRED') url += '/expired';
      else if (status === 'UPCOMING') url += '/upcoming';

      if (searchTerm && status === 'ALL') {
        params.code = searchTerm.trim();
      }

      const res = await axios.get(url, { params });
      setVouchers(res.data || { content: [], totalElements: 0 });
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách Rank Voucher');
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

  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAdd = () => setIsAddModalOpen(true);
  const handleCloseAdd = () => setIsAddModalOpen(false);

  // Mở form Update
  const handleOpenUpdate = (voucher) => {
    console.log("Edit voucher:", voucher);
    setSelectedVoucher(voucher);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdate = () => {
    setIsUpdateModalOpen(false);
    // Không cần set selectedVoucher = null ở đây để tránh giật UI
  };

  // Mở Detail
  const handleSelect = (voucher) => {
    setSelectedVoucher(voucher);
    setIsDetailDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailDrawerOpen(false);
    setSelectedVoucher(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa Rank Voucher này?')) return;
    try {
      await axios.delete(`http://localhost:8082/api/vouchers/rank/${id}`);
      handleCloseDetail(); // Đóng Detail nếu đang mở
      fetchVouchers();     // Refresh list
    } catch (err) {
      setError('Xóa thất bại');
    }
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <TextField
            label="Tìm theo mã"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '50%', bgcolor: 'white', borderRadius: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton><Search /></IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select value={status} onChange={handleStatusChange} label="Trạng thái">
              <MenuItem value="ALL">ALL</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="EXPIRED">EXPIRED</MenuItem>
              <MenuItem value="UPCOMING">UPCOMING</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" sx={{ bgcolor: 'green' }} onClick={handleOpenAdd}>
            Add
          </Button>
        </Box>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: '65vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Mã</strong></TableCell>
              <TableCell><strong>Loại</strong></TableCell>
              <TableCell><strong>Hạng yêu cầu</strong></TableCell>
              <TableCell><strong>Ngày bắt đầu</strong></TableCell>
              <TableCell><strong>Ngày kết thúc</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center">Đang tải...</TableCell></TableRow>
            ) : vouchers.content?.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">Không có dữ liệu</TableCell></TableRow>
            ) : (
              vouchers.content?.map((v) => (
                <TableRow key={v.id} hover onClick={() => handleSelect(v)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{v.id.substring(0, 8)}...</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{v.code}</TableCell>
                  <TableCell>{v.voucherType}</TableCell>
                  <TableCell>{v.requiredRank || v.rank || 'N/A'}</TableCell>
                  <TableCell>{v.startDate ? new Date(v.startDate).toLocaleDateString('vi-VN') : '-'}</TableCell>
                  <TableCell>{v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '-'}</TableCell>
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
        onPageChange={(e, p) => setPage(p)}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng:"
      />

      {/* Modals & Drawer */}
      {isAddModalOpen && (
        <AddRankVoucher open={isAddModalOpen} onClose={handleCloseAdd} onSuccess={fetchVouchers} />
      )}

      {/* UPDATE FORM: Truyền đúng props */}
      {isUpdateModalOpen && selectedVoucher && (
        <UpdateRankVoucher 
            voucher={selectedVoucher}     // Quan trọng: Tên prop là voucher
            onClose={handleCloseUpdate} 
            onSuccess={fetchVouchers}     // Callback reload list
        />
      )}

      <Drawer anchor="right" open={isDetailDrawerOpen} onClose={handleCloseDetail}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 800 }, p: 3 } }}>
        {selectedVoucher && (
          <RankVoucherDetail
            voucher={selectedVoucher}
            onClose={handleCloseDetail}
            onEdit={() => { 
                // Đóng Detail rồi mới mở Form Update
                handleCloseDetail(); 
                handleOpenUpdate(selectedVoucher); 
            }}
            onDelete={handleDelete}
          />
        )}
      </Drawer>
    </Box>
  );
};

export default RankVoucherTab;