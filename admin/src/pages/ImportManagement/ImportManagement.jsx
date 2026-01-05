import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Typography, Box, Grid, Divider, IconButton, Alert, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination
} from "@mui/material";
import { Add, Delete, CloudUpload, Close, ListAlt, CloudDownload } from '@mui/icons-material';
import axios from "axios";
import { saveAs } from 'file-saver';
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";
import ImportTable from "./component/ImportTable";

// Endpoint API
const API_BASE = "http://localhost:8081";

const importStock = async (books) => {
    await axios.post(`${API_BASE}/api/book/import-stock`, { books });
};

// Hàm xử lý import Excel
const importBooksFromExcel = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axios.post(`${API_BASE}/api/imports/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

const ImportManagement = () => {
    const [newBooks, setNewBooks] = useState([{
        bookName: "",
        bookAuthor: "",
        bookStockQuantity: "",
        bookSupplier: "",
        bookCategory: "",
        bookLanguage: "",
        bookPublisher: "",
        bookYearOfProduction: "",
        mainCategory: "",
        importPrice: ""
    }]);

    const [oldBooks, setOldBooks] = useState([]);
    const [isOldBookModalOpen, setIsOldBookModalOpen] = useState(false);

    // Thêm các state cho phân trang sách cũ
    const [availableBooks, setAvailableBooks] = useState([]);
    const [oldBooksPage, setOldBooksPage] = useState(0);
    const [oldBooksSize, setOldBooksSize] = useState(10); // Kích thước trang mặc định
    const [oldBooksTotal, setOldBooksTotal] = useState(0);

    const [excelFile, setExcelFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const [currentPage, setCurrentPage] = useState('import');

    const [refreshTable, setRefreshTable] = useState(0);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (isOldBookModalOpen) {
            fetchAvailableBooks(oldBooksPage, oldBooksSize);
        }
    }, [isOldBookModalOpen, oldBooksPage, oldBooksSize]);

    const fetchAvailableBooks = async (page, size) => {
        try {
            const response = await axios.get(`${API_BASE}/api/book?page=${page}&size=${size}`);
            setAvailableBooks(response.data.content);
            setOldBooksTotal(response.data.totalElements);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách sách:', err);
            setError("Không thể tải danh sách sách. Vui lòng thử lại.");
        }
    };

    const handleNewInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedNewBooks = [...newBooks];
        updatedNewBooks[index] = { ...updatedNewBooks[index], [name]: value };
        setNewBooks(updatedNewBooks);
    };

    const handleAddNewRow = () => {
        setNewBooks([...newBooks, {
            bookName: "", bookAuthor: "", bookStockQuantity: "", bookSupplier: "", bookCategory: "",
            bookLanguage: "", bookPublisher: "", bookYearOfProduction: "", mainCategory: "", importPrice: ""
        }]);
    };

    const handleRemoveNewRow = (index) => {
        const updatedNewBooks = newBooks.filter((_, i) => i !== index);
        setNewBooks(updatedNewBooks);
    };

    const handleManualImportNewBooks = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const validNewBooks = newBooks.filter(book => book.bookName.trim() && book.bookAuthor.trim() && book.bookStockQuantity && book.bookSupplier.trim() && book.importPrice);

        if (validNewBooks.length === 0) {
            setError("Vui lòng điền đủ Tên sách, Tác giả, Số lượng, Nhà cung cấp và Giá nhập cho ít nhất một cuốn sách.");
            setIsLoading(false);
            return;
        }

        const booksToImport = validNewBooks.map(book => ({
            bookName: book.bookName.trim(),
            bookAuthor: book.bookAuthor.trim(),
            bookStockQuantity: parseInt(book.bookStockQuantity, 10),
            bookSupplier: book.bookSupplier.trim(),
            bookCategory: book.bookCategory.trim() || 'NULL',
            bookLanguage: book.bookLanguage.trim() || 'NULL',
            bookPublisher: book.bookPublisher.trim() || 'NULL',
            mainCategory: book.mainCategory.trim() || 'NULL',
            bookYearOfProduction: parseInt(book.bookYearOfProduction, 10) || 1900,
            importPrice: parseFloat(book.importPrice)
        }));

        try {
            await importStock(booksToImport);
            alert("Nhập kho sách mới thành công!");
            setNewBooks([{
                bookName: "", bookAuthor: "", bookStockQuantity: "", bookSupplier: "", bookCategory: "",
                bookLanguage: "", bookPublisher: "", bookYearOfProduction: "", mainCategory: "", importPrice: ""
            }]);
            setRefreshTable(prev => prev + 1);
            setCurrentPage('list');
        } catch (err) {
            console.error('Lỗi khi nhập kho:', err);
            setError("Lỗi khi nhập kho sách mới. Vui lòng kiểm tra dữ liệu.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Thêm sách cũ vào danh sách, sử dụng một ID tạm thời để có thể thêm nhiều lần
    const handleSelectOldBook = (book) => {
        const tempId = `${book.id}-${Date.now()}`; // Tạo ID tạm thời duy nhất
        setOldBooks([...oldBooks, {
            ...book,
            tempId: tempId, // Thêm tempId để phân biệt các lần thêm khác nhau của cùng một cuốn sách
            bookStockQuantity: 1,
            importPrice: ""
        }]);
    };

    // Cập nhật sách cũ dựa trên tempId
    const handleOldBookInputChange = (e, tempId) => {
        const { name, value } = e.target;
        const updatedOldBooks = oldBooks.map(book =>
            book.tempId === tempId ? { ...book, [name]: name === 'bookStockQuantity' ? parseInt(value, 10) : value } : book
        );
        setOldBooks(updatedOldBooks);
    };

    // Xóa sách cũ dựa trên tempId
    const handleRemoveOldBook = (tempId) => {
        const updatedOldBooks = oldBooks.filter(book => book.tempId !== tempId);
        setOldBooks(updatedOldBooks);
    };

    const handleManualImportOldBooks = async () => {
        setIsLoading(true);
        setError(null);

        const validOldBooks = oldBooks.filter(book => book.bookStockQuantity > 0 && book.importPrice);

        if (validOldBooks.length === 0) {
            setError("Vui lòng nhập số lượng và giá nhập hợp lệ cho ít nhất một cuốn sách.");
            setIsLoading(false);
            return;
        }

        try {
            const booksToImport = validOldBooks.map(book => ({
                bookName: book.bookName,
                bookAuthor: book.bookAuthor,
                bookStockQuantity: parseInt(book.bookStockQuantity, 10),
                bookSupplier: book.bookSupplier || 'NULL',
                bookCategory: book.bookCategory || 'NULL',
                bookLanguage: book.bookLanguage || 'NULL',
                bookPublisher: book.bookPublisher || 'NULL',
                mainCategory: book.mainCategory || 'NULL',
                bookYearOfProduction: book.bookYearOfProduction || 1900,
                importPrice: parseFloat(book.importPrice)
            }));

            await importStock(booksToImport);
            alert("Nhập kho sách cũ thành công!");
            setOldBooks([]);
            setRefreshTable(prev => prev + 1);
            setCurrentPage('list');
        } catch (err) {
            console.error('Lỗi khi nhập kho:', err);
            setError("Lỗi khi nhập kho sách cũ. Vui lòng kiểm tra dữ liệu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExcelChange = (e) => {
        setExcelFile(e.target.files[0]);
        setError(null);
    };

    const handleExcelImport = async () => {
        if (!excelFile) {
            setError("Vui lòng chọn file Excel để import.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await importBooksFromExcel(excelFile);

            if (response.status === 200) {
                alert(response.data);
                setExcelFile(null);
                setRefreshTable(prev => prev + 1);
                setCurrentPage('list');
            }
        } catch (err) {
            console.error('Lỗi khi import file Excel:', err);
            if (err.response && err.response.data) {
                setError(`Lỗi: ${err.response.data}`);
            } else {
                setError("Lỗi khi import file Excel. Vui lòng kiểm tra lại file và thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportImports = async () => {
        try {
            const url = `${API_BASE}/api/imports/export`;
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await axios.get(`${url}?${params.toString()}`, {
                responseType: 'blob',
            });
            
            saveAs(response.data, 'imports.xlsx');
            alert("Đã xuất file Excel thành công!");
        } catch (error) {
            console.error('Lỗi khi xuất file Excel:', error);
            setError("Không thể xuất file Excel. Vui lòng thử lại.");
        }
    };

    // Hàm xử lý khi chuyển trang
    const handleOldBooksPageChange = (event, newPage) => {
        setOldBooksPage(newPage);
    };

    // Hàm xử lý khi thay đổi số lượng bản ghi trên 1 trang
    const handleOldBooksSizeChange = (event) => {
        setOldBooksSize(parseInt(event.target.value, 10));
        setOldBooksPage(0); // Reset về trang đầu tiên khi thay đổi kích thước
    };

    const renderImportPage = () => (
        <Box className="bg-white p-8 rounded-lg w-full max-w-6xl border-2 border-gray-300 shadow-lg mt-6">
            <Typography variant="h4" className="text-center text-gradient mb-4 font-bold">
                Nhập kho sách
            </Typography>

            <Divider sx={{ my: 3 }} />

{/* Form nhập sách mới */}
<Typography variant="h6" mb={2} className="font-semibold">Nhập sách mới</Typography>
<form onSubmit={handleManualImportNewBooks}>
    <Box className="max-h-96 overflow-y-auto pr-2">
        {newBooks.map((book, index) => (
            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                {/* 1. Tên sách - Giữ nguyên sm=3 */}
                <Grid item xs={12} sm={3}>
                    <TextField
                        label="Tên sách"
                        name="bookName"
                        fullWidth
                        value={book.bookName}
                        onChange={(e) => handleNewInputChange(e, index)}
                        required
                    />
                </Grid>

                {/* 2. Tác giả - Giảm sm từ 3 xuống 2 */}
                <Grid item xs={12} sm={2}>
                    <TextField
                        label="Tác giả"
                        name="bookAuthor"
                        fullWidth
                        value={book.bookAuthor}
                        onChange={(e) => handleNewInputChange(e, index)}
                        required
                    />
                </Grid>

                {/* 3. Nhà cung cấp (MỚI THÊM) - sm=2 */}
                <Grid item xs={12} sm={2}>
                    <TextField
                        label="Nhà cung cấp"
                        name="bookSupplier"
                        fullWidth
                        value={book.bookSupplier}
                        onChange={(e) => handleNewInputChange(e, index)}
                        required
                    />
                </Grid>

                {/* 4. Số lượng - Giữ nguyên sm=2 */}
                <Grid item xs={12} sm={2}>
                    <TextField
                        label="Số lượng"
                        name="bookStockQuantity"
                        type="number"
                        fullWidth
                        value={book.bookStockQuantity}
                        onChange={(e) => handleNewInputChange(e, index)}
                        required
                    />
                </Grid>

                {/* 5. Giá nhập - Giảm sm từ 3 xuống 2 */}
                <Grid item xs={12} sm={2}>
                    <TextField
                        label="Giá nhập"
                        name="importPrice"
                        type="number"
                        fullWidth
                        value={book.importPrice}
                        onChange={(e) => handleNewInputChange(e, index)}
                        required
                    />
                </Grid>

                {/* 6. Nút xóa - Giữ nguyên sm=1 */}
                <Grid item xs={1} sm={1}>
                    <IconButton onClick={() => handleRemoveNewRow(index)} color="error" disabled={newBooks.length === 1}>
                        <Delete />
                    </IconButton>
                </Grid>
            </Grid>
        ))}
    </Box>
    <Button onClick={handleAddNewRow} startIcon={<Add />} variant="outlined" sx={{ my: 2 }}>
        Thêm sách mới
    </Button>
    <Box className="flex justify-end">
        <Button type="submit" variant="contained" className="submit-button" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu sách mới"}
        </Button>
    </Box>
</form>

            <Divider sx={{ my: 3 }} />

            {/* Phần nhập sách cũ */}
            <Typography variant="h6" mb={2} className="font-semibold">Nhập sách cũ</Typography>
            <Box mb={2}>
                <Button onClick={() => setIsOldBookModalOpen(true)} startIcon={<Add />} variant="contained" color="secondary">
                    Thêm sách cũ
                </Button>
            </Box>

            {oldBooks.length > 0 && (
                <Box mt={4}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tên sách</TableCell>
                                    <TableCell>Tác giả</TableCell>
                                    <TableCell sx={{ width: '150px' }}>Số lượng</TableCell>
                                    <TableCell>Giá nhập</TableCell>
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {oldBooks.map(book => (
                                    <TableRow key={book.tempId}>
                                        <TableCell>{book.bookName}</TableCell>
                                        <TableCell>{book.bookAuthor}</TableCell>
                                        <TableCell>
                                            <TextField name="bookStockQuantity" type="number" size="small" value={book.bookStockQuantity} onChange={(e) => handleOldBookInputChange(e, book.tempId)} inputProps={{ min: 1 }} />
                                        </TableCell>
                                        <TableCell>
                                            <TextField name="importPrice" type="number" size="small" value={book.importPrice} onChange={(e) => handleOldBookInputChange(e, book.tempId)} required />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleRemoveOldBook(book.tempId)} color="error">
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {oldBooks.length > 0 && (
                <Box className="flex justify-end mt-4">
                    <Button onClick={handleManualImportOldBooks} variant="contained" className="submit-button" disabled={isLoading}>
                        {isLoading ? "Đang lưu..." : "Lưu sách cũ"}
                    </Button>
                </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Phần nhập từ Excel */}
            <Typography variant="h6" mb={2} className="font-semibold">Import từ file Excel</Typography>
            <Box className="flex flex-col sm:flex-row items-center gap-4">
                <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
                    Chọn file Excel
                    <input type="file" accept=".xlsx,.xls" hidden onChange={handleExcelChange} />
                </Button>
                {excelFile && <Typography variant="body2">{excelFile.name}</Typography>}
                <Button
                    variant="contained"
                    className="submit-button"
                    onClick={handleExcelImport}
                    disabled={isLoading || !excelFile}
                >
                    {isLoading ? "Đang import..." : "Import Excel"}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );

    const renderListPage = () => (
        <Box className="bg-white p-8 rounded-lg w-full max-w-6xl border-2 border-gray-300 shadow-lg mt-6">
            <Typography variant="h4" className="text-center text-gradient mb-4 font-bold">
                Danh sách nhập
            </Typography>
            <Box className="flex justify-between items-center mb-4">
                <Box className="flex space-x-4">
                    <TextField
                        label="Từ ngày"
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Đến ngày"
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<CloudDownload />} 
                    onClick={handleExportImports}
                >
                    Xuất Excel
                </Button>
            </Box>
            <ImportTable key={refreshTable} startDate={startDate} endDate={endDate} />
        </Box>
    );

    return (
        <div className="flex h-screen">
            <div className={`bg-white shadow-md z-50 fixed h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-1/6'}`}>
                <SideNav onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
            </div>
            <main
                className="flex-1 bg-gray-100 relative flex flex-col transition-all duration-300"
                style={{ marginLeft: isCollapsed ? '5rem' : '16.5%' }}
            >
                <Header title="QUẢN LÝ NHẬP KHO" isCollapsed={isCollapsed} className="sticky top-0 z-50 bg-white shadow-md" />
                
                <div className="flex-1 overflow-auto pt-32 px-6 flex flex-col items-center">
                    <div className="flex justify-center w-full max-w-6xl mt-4">
                        <Button
                            onClick={() => setCurrentPage('import')}
                            variant={currentPage === 'import' ? 'contained' : 'outlined'}
                            sx={{ mr: 2 }}
                            startIcon={<Add />}
                        >
                            Nhập sách
                        </Button>
                        <Button
                            onClick={() => setCurrentPage('list')}
                            variant={currentPage === 'list' ? 'contained' : 'outlined'}
                            startIcon={<ListAlt />}
                        >
                            Danh sách nhập
                        </Button>
                    </div>
                    {currentPage === 'import' ? renderImportPage() : renderListPage()}
                </div>
            </main>

            {/* Modal chọn sách cũ */}
            <Dialog open={isOldBookModalOpen} onClose={() => setIsOldBookModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        Chọn sách cũ để nhập
                        <IconButton onClick={() => setIsOldBookModalOpen(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Tên sách</TableCell>
                                    <TableCell>Tác giả</TableCell>
                                    <TableCell>Số lượng tồn</TableCell>
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {availableBooks.map((book) => (
                                    <TableRow key={book.id}>
                                        <TableCell>{book.id}</TableCell>
                                        <TableCell>{book.bookName}</TableCell>
                                        <TableCell>{book.bookAuthor}</TableCell>
                                        <TableCell>{book.bookStockQuantity}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" size="small" onClick={() => handleSelectOldBook(book)}>
                                                Thêm
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={oldBooksTotal}
                        page={oldBooksPage}
                        onPageChange={handleOldBooksPageChange}
                        rowsPerPage={oldBooksSize}
                        onRowsPerPageChange={handleOldBooksSizeChange}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage="Số hàng mỗi trang:"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ImportManagement;