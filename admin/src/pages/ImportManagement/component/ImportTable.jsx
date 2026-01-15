import React, { useState, useEffect } from 'react';
import {
    Box, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
    Table, TableBody, TableCell, TableHead, TableRow, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import moment from 'moment';

const API_BASE = "http://localhost:8081/api/imports";

const ImportTable = () => {
    const [imports, setImports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Ở đây ta load tất cả (hoặc load trang lớn) để client tự group cho đẹp
    // Nếu dữ liệu quá lớn, nên dùng logic lazy load trong accordion (advanced)
    const fetchImports = async () => {
        try {
            const response = await axios.get(`${API_BASE}?page=0&size=1000`); // Load 1000 records gần nhất
            setImports(response.data.content);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchImports(); }, []);

    // Hàm nhóm dữ liệu theo ngày
    const groupedImports = imports.reduce((groups, item) => {
        const date = moment(item.importDate).format("DD/MM/YYYY");
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(item);
        return groups;
    }, {});

    if (isLoading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h6" mb={2}>Lịch sử nhập hàng (Gần đây)</Typography>
            
            {Object.keys(groupedImports).map((date) => (
                <Accordion key={date} defaultExpanded={false}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} className="bg-gray-50">
                        <Box className="flex items-center justify-between w-full pr-4">
                            <Typography className="font-bold text-lg text-blue-800">
                                📅 Ngày {date}
                            </Typography>
                            <Chip label={`${groupedImports[date].length} cuốn`} size="small" color="primary" />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Table size="small">
                            <TableHead>
                                <TableRow className="bg-gray-100">
                                    <TableCell>Tên sách</TableCell>
                                    <TableCell>Tác giả</TableCell>
                                    <TableCell align="right">Số lượng nhập</TableCell>
                                    <TableCell align="right">Giá nhập</TableCell>
                                    <TableCell>Giờ nhập</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groupedImports[date].map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{item.bookName}</TableCell>
                                        <TableCell>{item.bookAuthor}</TableCell>
                                        <TableCell align="right" className="font-bold text-green-600">
                                            +{item.quantity}
                                        </TableCell>
                                        <TableCell align="right">
                                            {item.importPrice.toLocaleString()} đ
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {moment(item.importDate).format("HH:mm")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionDetails>
                </Accordion>
            ))}
            
            {imports.length === 0 && <Typography align="center">Chưa có lịch sử nhập hàng.</Typography>}
        </Box>
    );
};

export default ImportTable;