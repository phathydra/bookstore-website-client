import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box
} from '@mui/material';
// Bỏ import 'IconButton' và 'Icons'
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import { getCombos, deleteCombo } from './services/comboService';
import ComboForm from './components/ComboForm'; 
import ComboDetail from './components/ComboDetail'; // <-- THÊM MỚI

const ComboManagement = () => {
  const [combos, setCombos] = useState({ content: [], totalElements: 0 });
  
  // State quản lý form modal (Sửa/Thêm)
  const [isFormOpen, setIsFormOpen] = useState(false);
  // State quản lý drawer chi tiết
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // <-- THÊM MỚI

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

  // ----- CẬP NHẬT CÁC HÀM XỬ LÝ -----
  
  // Mở form để TẠO MỚI (Nút "Tạo Combo Mới")
  const handleOpenAddForm = () => {
    setSelectedCombo(null); // Không có dữ liệu ban đầu
    setIsFormOpen(true);
    setIsDrawerOpen(false); // Đảm bảo drawer chi tiết đã đóng
  };

  // Mở drawer CHI TIẾT (Khi click vào 1 hàng)
  const handleRowClick = (combo) => {
    setSelectedCombo(combo); // Lưu combo được chọn
    setIsDrawerOpen(true); // Mở drawer
    setIsFormOpen(false); // Đảm bảo form modal đã đóng
  };

  // Mở form để SỬA (Từ nút "Sửa" trên drawer)
  const handleOpenEditForm = () => {
    // selectedCombo đã được set khi click vào hàng
    setIsDrawerOpen(false); // Đóng drawer
    setIsFormOpen(true);  // Mở form modal
  };

  // Đóng drawer chi tiết
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCombo(null);
  };
  
  // Đóng form modal (Sửa/Thêm)
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCombo(null); 
  };

  // Callback khi lưu (Thêm/Sửa) thành công
  const handleSaveCombo = () => {
    fetchCombos(); 
    handleCloseForm();
  };
  
  // Xử lý XÓA (Từ nút "Xóa" trên drawer)
  const handleDeleteCombo = async (comboId) => {
    // 'window.confirm' đã được xử lý bên trong ComboDetail
    try {
      await deleteCombo(comboId);
      fetchCombos();
      handleCloseDrawer(); // Đóng drawer sau khi xóa
    } catch (error) {
      console.error('Error deleting combo:', error);
      alert("Lỗi khi xóa combo.");
    }
  };
  // ------------------------------------------

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Helper hiển thị trạng thái (giữ nguyên)
  const getComboStatus = (combo) => {
    if (!combo.startDate || !combo.endDate) return 'Chưa thiết lập';
    const now = new Date();
    const start = new Date(combo.startDate);
    const end = new Date(combo.endDate);

    if (now < start) return <Typography color="blue">Chưa bắt đầu</Typography>;
    if (now > end) return <Typography color="error">Đã kết thúc</Typography>;
    return <Typography color="green">Đang hoạt động</Typography>;
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
          <Box className="flex-1 flex items-center justify-center"></Box>
          <Box className="flex gap-2">
            {/* Nút này vẫn gọi hàm mở form TẠO MỚI */}
            <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={handleOpenAddForm}>
              TẠO COMBO MỚI
            </Button>
          </Box>
        </Box>

        <div className="flex-1 overflow-auto pt-[72px] px-2">
          <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {/* Bỏ cột "Hành động" */}
                  {['Tên Combo', 'Loại Giảm Giá', 'Giá Trị Giảm', 'Sách Áp Dụng', 'Trạng thái'].map((header) => (
                    <TableCell key={header} sx={{ fontWeight: 'bold' }}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {combos?.content?.map((combo) => (
                  // Thêm onClick vào Row
                  <TableRow 
                    key={combo.comboId} 
                    hover 
                    onClick={() => handleRowClick(combo)} // <-- THÊM MỚI
                    sx={{ cursor: 'pointer' }} // Thêm cursor
                  >
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">{combo.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{combo.description}</Typography>
                    </TableCell>
                    <TableCell>{combo.discountType}</TableCell>
                    <TableCell>
                      {combo.discountType === 'PERCENT'
                        ? `${combo.discountValue}%`
                        : `${combo.discountValue.toLocaleString()}₫`}
                    </TableCell>
                    <TableCell>{combo.bookIds.length} sách</TableCell>
                    <TableCell>
                      {getComboStatus(combo)}
                    </TableCell>
                    {/* Bỏ cột "Hành động" ở đây */}
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

        {/* Form Modal (cho Thêm/Sửa) */}
        {isFormOpen && (
          <ComboForm 
            onClose={handleCloseForm} 
            onSave={handleSaveCombo}
            initialData={selectedCombo} // Sẽ là null (Thêm) hoặc có data (Sửa)
          />
        )}

        {/* Drawer Chi Tiết (MỚI) */}
        <ComboDetail
            selectedCombo={isDrawerOpen ? selectedCombo : null} // Chỉ truyền data khi drawer mở
            onClose={handleCloseDrawer}
            onEdit={handleOpenEditForm}
            onDelete={handleDeleteCombo}
        />

      </main>
    </div>
  );
};

export default ComboManagement;