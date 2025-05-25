import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TablePagination,
    Button, Box, IconButton, TextField, InputAdornment, Drawer // Import Drawer
} from '@mui/material';
import { Search } from '@mui/icons-material';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import AddVoucher from './AddVoucher';
import UpdateVoucher from './UpdateVoucher';
import VoucherDetail from './VoucherDetail'; // Import VoucherDetail
// import EditIcon from '@mui/icons-material/Edit'; // Không còn sử dụng
// import DeleteIcon from '@mui/icons-material/Delete'; // Không còn sử dụng

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState({ content: [], totalElements: 0 });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            refreshVouchers();
        }, 300)

        return () => clearTimeout(delayDebounce);
    }, [page, rowsPerPage, searchTerm]);

    const refreshVouchers = async () => {
        try {
            const response = await axios.get(`http://localhost:8082/api/vouchers?page=${page}&size=${rowsPerPage}&code=${searchTerm}`);
            setVouchers(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            setError('Failed to fetch vouchers. Please try again.');
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        refreshVouchers();
    };

    const handleOpenUpdateModal = (voucher) => {
        setSelectedVoucher(voucher);
        setIsUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedVoucher(null);
        refreshVouchers();
    };

    const handleDeleteVoucher = async (id) => {
        if (window.confirm('Are you sure you want to delete this voucher?')) {
            try {
                await axios.delete(`http://localhost:8082/api/vouchers/${id}`);
                refreshVouchers();
                setIsDetailDrawerOpen(false);
                setSelectedVoucher(null);
            } catch (error) {
                console.error('Error deleting voucher:', error);
                setError('Failed to delete voucher. Please try again.');
            }
        }
    };

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleSelectVoucher = (voucher) => {
        setSelectedVoucher(voucher);
        setIsDetailDrawerOpen(true);
    };

    const handleCloseDetailDrawer = () => {
        setIsDetailDrawerOpen(false);
        setSelectedVoucher(null);
    };

    return (
        <div className="flex h-screen">
            <div
                className={`bg-white shadow-md z-50 fixed h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-1/6'}`}
            >
                <SideNav onToggleCollapse={handleToggleCollapse} />
            </div>
            <main
                className="flex-1 bg-gray-100 relative flex flex-col transition-all duration-300"
                style={{ marginLeft: isCollapsed ? '5rem' : '16.666667%' }}
            >
                <Header title="QUẢN LÝ VOUCHER" isCollapsed={isCollapsed} />
                <div className="p-10 pt-20 flex w-full overflow-x-auto" style={{ gap: '1rem' }}>
                    <Box className="flex-1 overflow-auto">
                        <Box className="flex justify-between mb-2">
                            <Box className="flex-1 flex justify-center">
                                <TextField
                                    label="Search by code"
                                    variant="outlined"
                                    size="small"
                                    value={searchTerm}
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
                                        style: { borderRadius: '8px' }
                                    }}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                style={{ backgroundColor: 'green' }}
                                onClick={handleOpenAddModal}
                            >
                                Thêm Voucher
                            </Button>
                        </Box>
                        {error && (
                            <Typography color="error" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}
                        <TableContainer component={Paper} style={{ maxHeight: '70vh', overflowX: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Mã</TableCell>
                                        <TableCell>Loại</TableCell>
                                        <TableCell>Ngày bắt đầu</TableCell>
                                        <TableCell>Ngày kết thúc</TableCell>
                                        {/* Đã xóa <TableCell>Actions</TableCell> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vouchers.content?.map((voucher) => (
                                        <TableRow key={voucher.id}
                                            onClick={() => handleSelectVoucher(voucher)}
                                            hover
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{voucher.id}</TableCell>
                                            <TableCell>{voucher.code}</TableCell>
                                            <TableCell>{voucher.voucherType}</TableCell>
                                            <TableCell>{new Date(voucher.startDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(voucher.endDate).toLocaleDateString()}</TableCell>
                                            {/* Đã xóa <TableCell> và các IconButton */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={vouchers.totalElements || 0}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Box>
                </div>
                {isAddModalOpen && <AddVoucher onClose={handleCloseAddModal} onSuccess={refreshVouchers} />}
                {isUpdateModalOpen && (
                    <UpdateVoucher selectedVoucher={selectedVoucher} onClose={handleCloseUpdateModal} onSuccess={refreshVouchers} />
                )}

                <Drawer
                    anchor="right"
                    open={isDetailDrawerOpen}
                    onClose={handleCloseDetailDrawer}
                    sx={{
                        width: 400,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 800,
                            boxSizing: 'border-box',
                            padding: '24px'
                        },
                    }}
                >
                    <VoucherDetail
                        selectedVoucher={selectedVoucher}
                        onClose={handleCloseDetailDrawer}
                        onUpdate={() => {
                            handleOpenUpdateModal(selectedVoucher);
                            setIsDetailDrawerOpen(false);
                        }}
                        onDelete={() => handleDeleteVoucher(selectedVoucher.id)}
                    />
                </Drawer>
            </main>
        </div>
    );
};

export default VoucherManagement;