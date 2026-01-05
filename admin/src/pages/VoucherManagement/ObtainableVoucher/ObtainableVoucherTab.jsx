import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  TablePagination, Button, Box, TextField, InputAdornment, IconButton, Drawer,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Search } from '@mui/icons-material';

import AddObtainableVoucher from './AddObtainableVoucher';
import UpdateObtainableVoucher from './UpdateObtainableVoucher';
import ObtainableVoucherDetail from './ObtainableVoucherDetail';

const ObtainableVoucherTab = () => {
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
      let url = 'http://localhost:8082/api/vouchers/obtainable';
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
      setError('Không thể tải danh sách Obtainable Voucher');
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
  }, [status, searchTerm]);

  // Handlers
  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleOpenAdd = () => setIsAddModalOpen(true);
  const handleCloseAdd = () => setIsAddModalOpen(false);

  // Logic mở form Update
  const handleOpenUpdate = (voucher) => {
    console.log("Mở form update cho voucher:", voucher);
    setSelectedVoucher(voucher);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdate = () => {
    setIsUpdateModalOpen(false);
    // Lưu ý: Không set selectedVoucher = null ở đây ngay nếu muốn giữ UX mượt
    // hoặc nếu logic Detail Drawer phụ thuộc vào nó.
    // Tuy nhiên ở logic này, form Update đè lên tất cả nên OK.
  };

  const handleSelect = (voucher) => {
    setSelectedVoucher(voucher);
    setIsDetailDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailDrawerOpen(false);
    setSelectedVoucher(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa Obtainable Voucher này?')) return;
    try {
      await axios.delete(`http://localhost:8082/api/vouchers/obtainable/${id}`);
      handleCloseDetail(); // Đóng drawer
      fetchVouchers();     // Reload list
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
            label="Tìm theo mã voucher"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={status !== 'ALL'}
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
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select value={status} onChange={handleStatusChange} label="Trạng thái">
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
              <MenuItem value="EXPIRED">Đã hết hạn</MenuItem>
              <MenuItem value="UPCOMING">Sắp diễn ra</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="success"
            onClick={handleOpenAdd}
          >
            + Thêm Mới
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
              <TableCell><strong>Giá trị yêu cầu</strong></TableCell>
              <TableCell><strong>Công khai</strong></TableCell>
              <TableCell><strong>Ngày bắt đầu</strong></TableCell>
              <TableCell><strong>Ngày kết thúc</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Đang tải...</TableCell>
              </TableRow>
            ) : vouchers.content?.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">Không có dữ liệu</TableCell></TableRow>
            ) : (
              vouchers.content?.map((v) => (
                <TableRow
                  key={v.id}
                  hover
                  onClick={() => handleSelect(v)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{v.id.substring(0, 8)}...</TableCell>
                  <TableCell sx={{color: 'primary.main', fontWeight: 'bold'}}>{v.code}</TableCell>
                  <TableCell>{v.voucherType || '—'}</TableCell>
                  <TableCell>{v.valueRequirement ? v.valueRequirement.toLocaleString() : 0} đ</TableCell>
                  <TableCell>{v.publicClaimable ? 'Có' : 'Không'}</TableCell>
                  <TableCell>{v.startDate ? new Date(v.startDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                  <TableCell>{v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={vouchers.totalElements || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Số dòng:"
      />

      {/* Modals */}
      {isAddModalOpen && (
        <AddObtainableVoucher open={isAddModalOpen} onClose={handleCloseAdd} onSuccess={fetchVouchers} />
      )}

      {/* --- FORM UPDATE ĐÃ SỬA --- */}
      {isUpdateModalOpen && selectedVoucher && (
        <UpdateObtainableVoucher
          voucher={selectedVoucher}     // Truyền đúng prop 'voucher'
          onClose={handleCloseUpdate}
          onSuccess={fetchVouchers}     // Truyền hàm reload data
        />
      )}

      {/* Drawer Detail */}
      <Drawer
        anchor="right"
        open={isDetailDrawerOpen}
        onClose={handleCloseDetail}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 800 }, p: 3 } }}
      >
        {selectedVoucher && (
          <ObtainableVoucherDetail
            voucher={selectedVoucher}
            onClose={handleCloseDetail}
            onEdit={() => {
              // Quy trình: Đóng Drawer Detail -> Mở Modal Update
              handleCloseDetail();
              handleOpenUpdate(selectedVoucher);
            }}
            onDelete={() => handleDelete(selectedVoucher.id)}
          />
        )}
      </Drawer>
    </Box>
  );
};

export default ObtainableVoucherTab;