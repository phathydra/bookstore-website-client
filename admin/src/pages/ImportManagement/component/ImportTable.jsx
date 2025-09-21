import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    TablePagination, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import moment from 'moment';

const API_BASE = "http://localhost:8081/api/imports";

const ImportTable = () => {
    const [imports, setImports] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchImports();
    }, [page, rowsPerPage]);

    const fetchImports = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE}`, {
                params: {
                    page: page,
                    size: rowsPerPage
                }
            });
            setImports(response.data.content);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error("Lỗi khi tải thông tin nhập hàng:", err);
            setError("Không thể tải dữ liệu nhập hàng. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Typography variant="h5" mb={2} className="font-semibold">Lịch sử nhập hàng</Typography>
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && (
                <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            )}
            {!isLoading && !error && (
                <Paper>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Tên sách</TableCell>
                                    <TableCell>Tác giả</TableCell>
                                    <TableCell>Số lượng</TableCell>
                                    <TableCell>Giá nhập</TableCell>
                                    <TableCell>Nhà cung cấp</TableCell>
                                    <TableCell>Ngày nhập</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {imports.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.bookName}</TableCell>
                                        <TableCell>{item.bookAuthor}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.importPrice}</TableCell>
                                        <TableCell>{item.bookSupplier}</TableCell>
                                        <TableCell>{moment(item.importDate).format('DD/MM/YYYY HH:mm')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalElements}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Số dòng mỗi trang:"
                    />
                </Paper>
            )}
        </Box>
    );
};

export default ImportTable;