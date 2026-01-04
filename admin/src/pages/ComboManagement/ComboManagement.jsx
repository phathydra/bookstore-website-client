import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box, Avatar
} from '@mui/material';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import { getCombos, deleteCombo } from './services/comboService'; // Nhớ trỏ đúng đường dẫn
import ComboForm from './components/ComboForm'; 
import ComboDetail from './components/ComboDetail'; 

const ComboManagement = () => {
  const [combos, setCombos] = useState({ content: [], totalElements: 0 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null); 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchCombos();
  }, [page, rowsPerPage]);

  const fetchCombos = async () => {
    try {
      const response = await getCombos(page, rowsPerPage);
      setCombos(response.data);
    } catch (error) {
      console.error('Error fetching combos:', error);
      setCombos({ content: [], totalElements: 0 });
    }
  };

  const handleOpenAddForm = () => {
    setSelectedCombo(null);
    setIsFormOpen(true);
    setIsDrawerOpen(false);
  };

  const handleRowClick = (combo) => {
    setSelectedCombo(combo);
    setIsDrawerOpen(true);
    setIsFormOpen(false);
  };

  const handleOpenEditForm = () => {
    setIsDrawerOpen(false);
    setIsFormOpen(true); 
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCombo(null);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCombo(null); 
  };

  const handleSaveCombo = () => {
    fetchCombos(); 
    handleCloseForm();
  };
  
  const handleDeleteCombo = async (comboId) => {
    try {
      await deleteCombo(comboId);
      fetchCombos();
      handleCloseDrawer();
    } catch (error) {
      console.error('Error deleting combo:', error);
      alert("Lỗi khi xóa combo.");
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getComboStatus = (combo) => {
    if (!combo.startDate || !combo.endDate) return <Typography color="textSecondary" variant="body2">Chưa thiết lập</Typography>;
    const now = new Date();
    const start = new Date(combo.startDate);
    const end = new Date(combo.endDate);
    if (now < start) return <Typography color="blue" variant="body2" fontWeight="bold">Chưa bắt đầu</Typography>;
    if (now > end) return <Typography color="error" variant="body2" fontWeight="bold">Đã kết thúc</Typography>;
    return <Typography color="success.main" variant="body2" fontWeight="bold">Đang hoạt động</Typography>;
  };

  return (
    <div className="flex h-screen">
      <div className={`bg-white shadow-md z-50 fixed h-full transition-all duration-300 ${isCollapsed ? 'w-20' : '1/6'}`}>
        <SideNav onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </div>
      <main
        className="flex-1 bg-gray-100 relative flex flex-col transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '5rem' : '16.5%' }}
      >
        <Header title="QUẢN LÝ COMBO" isCollapsed={isCollapsed} className="sticky top-0 z-50 bg-white shadow-md" />
        <Box className="sticky top-[64px] z-40 bg-gray-100 shadow-md p-4 flex items-center border-b justify-between">
          <Box className="flex-1"></Box>
          <Button variant="contained" color="success" onClick={handleOpenAddForm}>
            TẠO COMBO MỚI
          </Button>
        </Box>

        <div className="flex-1 overflow-auto pt-[72px] px-2">
          <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {/* CỘT ẢNH MỚI */}
                  <TableCell sx={{ fontWeight: 'bold' }}>Ảnh</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên Combo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Loại Giảm Giá</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Giá Trị Giảm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sách Áp Dụng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {combos?.content?.map((combo) => (
                  <TableRow 
                    key={combo.comboId} 
                    hover 
                    onClick={() => handleRowClick(combo)} 
                    sx={{ cursor: 'pointer' }}
                  >
                    {/* HIỂN THỊ ẢNH NHỎ */}
                    <TableCell>
                      <Avatar 
                        variant="rounded" 
                        src={combo.image} 
                        alt={combo.name}
                        sx={{ width: 60, height: 40, bgcolor: '#eee', color: '#999' }}
                      >
                         {!combo.image && 'N/A'}
                      </Avatar>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">{combo.name}</Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {combo.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{combo.discountType === 'PERCENT' ? 'Phần trăm' : 'Tiền mặt'}</TableCell>
                    <TableCell>
                      {combo.discountType === 'PERCENT'
                        ? <Typography fontWeight="bold" color="primary">{combo.discountValue}%</Typography>
                        : <Typography fontWeight="bold" color="primary">{combo.discountValue.toLocaleString()}₫</Typography>}
                    </TableCell>
                    <TableCell>{combo.bookIds?.length || 0} sách</TableCell>
                    <TableCell>{getComboStatus(combo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="sticky bottom-0 bg-white shadow-md">
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={combos?.totalElements || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </div>

        {isFormOpen && (
          <ComboForm 
            onClose={handleCloseForm} 
            onSave={handleSaveCombo}
            initialData={selectedCombo}
          />
        )}

        <ComboDetail
            selectedCombo={isDrawerOpen ? selectedCombo : null}
            onClose={handleCloseDrawer}
            onEdit={handleOpenEditForm}
            onDelete={handleDeleteCombo}
        />

      </main>
    </div>
  );
};

export default ComboManagement;