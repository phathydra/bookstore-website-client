import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, TablePagination, Button, Box, Drawer, TextField, InputAdornment, IconButton,
    Snackbar, Alert, CircularProgress
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { debounce } from 'lodash';
import UpdateInformation from './UpdateInformation';
import InformationDetail from './InformationDetail';

const InformationManagement = () => {
    const [information, setInformation] = useState({ content: [], totalElements: 0 });
    const [selectedInformation, setSelectedInformation] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInformation();
    }, [page, rowsPerPage, searchTerm]);

    const fetchInformation = async () => {
        setLoading(true);
        try {
            let response;
            if (searchTerm) {
                response = await axios.post(
                    `http://localhost:8080/api/account/information_search?page=${page}&size=${rowsPerPage}&input=${searchTerm}`
                );
            } else {
                response = await axios.get(
                    `http://localhost:8080/api/account/allInformation?page=${page}&size=${rowsPerPage}`
                );
            }
            setInformation(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thông tin:', error);
            setSnackbar({ open: true, message: 'Lỗi khi lấy danh sách thông tin.', severity: 'error' });
            setLoading(false);
        }
    };

    const debouncedSearch = debounce((term) => {
        setSearchTerm(term);
        setPage(0);
    }, 500);

    const handleSearchChange = (event) => {
        debouncedSearch(event.target.value);
    };

    const handleSelectInformation = (info) => {
        setSelectedInformation(info);
        setIsDrawerOpen(true);
    };

    const handleToggleMenu = (collapsed) => {
        setIsCollapsed(collapsed);
    };

    const handleUpdateInformation = (updatedInfo) => {
        setInformation({
            ...information,
            content: information.content.map((info) =>
                info.id === updatedInfo.id ? updatedInfo : info
            ),
        });
        setIsUpdateModalOpen(false);
        setSnackbar({ open: true, message: 'Cập nhật thông tin thành công.', severity: 'success' });
    };

    return (
    <div className="flex h-screen">
        <SideNav onToggleCollapse={handleToggleMenu} />
        <main
        className="flex-1 bg-gray-100 relative flex flex-col transition-all duration-300"
        style={{ paddingLeft: isCollapsed ? '5%' : '16.5%' }}
        >
        <Header
            title="QUẢN LÝ THÔNG TIN KHÁCH HÀNG"
            isCollapsed={isCollapsed}
            className="sticky top-0 z-50 bg-white shadow-md"
        />
        <Box className="sticky top-[64px] z-40 bg-gray-100 shadow-md p-4 flex items-center border-b justify-center">
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
        <div className="flex-1 overflow-auto pt-[72px] px-2">
            <TableContainer component={Paper} style={{ maxHeight: '70vh', overflowX: 'auto' }}>
            <Table stickyHeader>
                <TableHead>
                <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Account ID</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Điện thoại</TableCell>
                    <TableCell>Địa chỉ</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {information?.content?.map((info) => (
                    <TableRow key={info.id} onClick={() => handleSelectInformation(info)} hover>
                    <TableCell>{info.id ?? 'N/A'}</TableCell>
                    <TableCell>{info.accountId ?? 'N/A'}</TableCell>
                    <TableCell>{info.name?.trim() || 'N/A'}</TableCell>
                    <TableCell>{info.email?.trim() || 'N/A'}</TableCell>
                    <TableCell>{info.phone?.trim() || 'N/A'}</TableCell>
                    <TableCell>{info.address?.trim() || 'N/A'}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
            <Box className="sticky bottom-0 bg-white shadow-md">
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={information?.totalElements || 0}
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
                width: 500,
                boxSizing: 'border-box',
            },
            }}
        >
            <InformationDetail selectedInformation={selectedInformation} />
        </Drawer>
        {isUpdateModalOpen && (
            <UpdateInformation
            selectedInformation={selectedInformation}
            onUpdate={handleUpdateInformation}
            onClose={() => setIsUpdateModalOpen(false)}
            />
        )}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
            </Alert>
        </Snackbar>
        </main>
    </div>
    );

};

export default InformationManagement;