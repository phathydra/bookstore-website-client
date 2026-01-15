import React, { useState } from "react";
import {
  TextField, Button, Typography, Box, IconButton, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, CircularProgress, Tooltip, Chip,
  Menu, MenuItem, ListItemText, ListItemIcon
} from "@mui/material";
import { Close, CloudUpload, Save, ArrowBack, Warning, Search } from '@mui/icons-material';
import { previewExcel, confirmImport } from "../services/importService"; 

// --- COMPONENT CON: Bảng dữ liệu ---
const EditableTable = ({ data, onUpdate, onAcceptSuggestion }) => {
    // State quản lý Menu gợi ý
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);

    const handleOpenMenu = (event, index) => {
        setAnchorEl(event.currentTarget);
        setSelectedIndex(index);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedIndex(null);
    };

    // Khi người dùng chọn 1 cuốn sách từ Menu
    const handleSelectSuggestion = (suggestion) => {
        if (selectedIndex !== null) {
            // Gọi hàm ở cha để xử lý di chuyển
            onAcceptSuggestion(selectedIndex, suggestion);
        }
        handleCloseMenu();
    };
    
    const handleChange = (index, field, value) => {
        const newData = [...data];
        newData[index][field] = value;
        onUpdate(newData);
    };

    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: 400, mt: 2, border: '1px solid #e0e0e0' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow sx={{ '& th': { backgroundColor: '#f5f5f5', fontWeight: 'bold' } }}>
                            <TableCell>Tên sách</TableCell>
                            <TableCell>Tác giả</TableCell>
                            <TableCell>Nhà cung cấp</TableCell>
                            <TableCell width="100">Số lượng</TableCell>
                            <TableCell width="120">Giá nhập</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={row.id || index} hover sx={{ backgroundColor: row.warning ? '#fff7ed' : 'inherit' }}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <TextField 
                                            value={row.bookName} size="small" fullWidth variant="standard"
                                            InputProps={{ disableUnderline: true }}
                                            onChange={(e) => handleChange(index, 'bookName', e.target.value)}
                                            error={!!row.warning}
                                        />
                                        {/* Nút Kính lúp: Chỉ hiện khi có suggestions */}
                                        {row.warning && row.suggestions && row.suggestions.length > 0 && (
                                            <Tooltip title="Bấm để chọn sách đúng từ danh sách gợi ý">
                                                <IconButton 
                                                    size="small" 
                                                    color="warning" 
                                                    onClick={(e) => handleOpenMenu(e, index)}
                                                    sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'warning.main' }}
                                                >
                                                    <Search fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                    {row.warning && (
                                        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                                            {row.warning}
                                        </Typography>
                                    )}
                                </TableCell>
                                {/* Các cột khác */}
                                <TableCell><TextField value={row.bookAuthor} size="small" fullWidth variant="standard" InputProps={{ disableUnderline: true }} onChange={(e) => handleChange(index, 'bookAuthor', e.target.value)} /></TableCell>
                                <TableCell><TextField value={row.bookSupplier} size="small" fullWidth variant="standard" InputProps={{ disableUnderline: true }} onChange={(e) => handleChange(index, 'bookSupplier', e.target.value)} /></TableCell>
                                <TableCell><TextField type="number" value={row.bookStockQuantity} size="small" variant="standard" InputProps={{ disableUnderline: true }} onChange={(e) => handleChange(index, 'bookStockQuantity', parseInt(e.target.value) || 0)} error={row.bookStockQuantity <= 0} /></TableCell>
                                <TableCell><TextField type="number" value={row.importPrice} size="small" variant="standard" InputProps={{ disableUnderline: true }} onChange={(e) => handleChange(index, 'importPrice', parseFloat(e.target.value) || 0)} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MENU HIỂN THỊ DANH SÁCH GỢI Ý */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{ sx: { width: 450, maxHeight: 300 } }}
            >
                {selectedIndex !== null && data[selectedIndex]?.suggestions?.length > 0 ? (
                    data[selectedIndex].suggestions.map((sug) => (
                        <MenuItem key={sug.id} onClick={() => handleSelectSuggestion(sug)} divider>
                            <ListItemIcon>
                                <Chip 
                                    label={`${sug.similarity}%`} 
                                    size="small" 
                                    color={sug.similarity > 80 ? "success" : "default"} 
                                    sx={{ minWidth: 50 }}
                                />
                            </ListItemIcon>
                            <ListItemText 
                                primary={sug.name} 
                                secondary="Bấm để chọn sách này" 
                                primaryTypographyProps={{ fontWeight: 'medium' }}
                            />
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>Không có gợi ý nào phù hợp</MenuItem>
                )}
            </Menu>
        </>
    );
};

// --- COMPONENT CHÍNH ---
const ImportModal = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [excelFile, setExcelFile] = useState(null);
    const [previewData, setPreviewData] = useState({ newBooks: [], existingBooks: [] });
    const [tabIndex, setTabIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePreview = async () => {
        if (!excelFile) return;
        setIsLoading(true); setError(null);
        try {
            const res = await previewExcel(excelFile);
            setPreviewData(res.data);
            if (res.data.newBooks.length > 0) setTabIndex(0); else setTabIndex(1);
            setStep(2);
        } catch (err) { console.error(err); setError("Lỗi đọc file Excel."); } finally { setIsLoading(false); }
    };
    
    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await confirmImport(previewData);
            alert("Đã nhập kho thành công!");
            if (onSuccess) onSuccess(); onClose();
        } catch (err) { setError("Lỗi lưu dữ liệu."); } finally { setIsLoading(false); }
    };

    // --- LOGIC CHUYỂN SÁCH KHI USER CHỌN TỪ MENU ---
    const handleMoveToExisting = (index, selectedSuggestion) => {
        const itemToMove = previewData.newBooks[index];

        const newItem = {
            ...itemToMove,
            id: selectedSuggestion.id,         // Lấy ID của cuốn sách user CHỌN
            bookName: selectedSuggestion.name, // Lấy tên đúng của cuốn sách user CHỌN
            warning: null
        };

        setPreviewData(prev => ({
            newBooks: prev.newBooks.filter((_, i) => i !== index),
            existingBooks: [...prev.existingBooks, newItem]
        }));
    };

    return (
        <Box className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <Box className="bg-white rounded-lg w-full max-w-6xl border shadow-xl relative flex flex-col max-h-[90vh]">
                {/* Header, Content Bước 1... GIỮ NGUYÊN */}
                <Box className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <Typography variant="h6" className="font-bold text-blue-700">{step === 1 ? "Nhập kho từ Excel" : "Kiểm tra & Chỉnh sửa"}</Typography>
                    <IconButton onClick={onClose} color="error"><Close /></IconButton>
                </Box>
                
                <Box className="p-6 overflow-y-auto flex-1">
                    {step === 1 && (
                         <Box className="flex flex-col items-center justify-center py-10 gap-6">
                            <Typography className="text-gray-600">Vui lòng chọn file Excel (.xlsx)</Typography>
                            <Box className="border-2 border-dashed border-gray-300 p-10 rounded-lg bg-gray-50 w-full max-w-md flex flex-col items-center">
                                <Button variant="contained" component="label" startIcon={<CloudUpload />} size="large">
                                    Chọn file máy tính
                                    <input type="file" accept=".xlsx" hidden onChange={(e) => { setExcelFile(e.target.files[0]); setError(null); }} />
                                </Button>
                                {excelFile && <Typography sx={{ mt: 2, fontWeight: 'bold' }}>📄 {excelFile.name}</Typography>}
                            </Box>
                            <Button variant="contained" onClick={handlePreview} disabled={!excelFile || isLoading} size="large" sx={{ minWidth: 200 }}>
                                {isLoading ? <CircularProgress size={24} color="inherit"/> : "Tiếp tục: Xem trước"}
                            </Button>
                        </Box>
                    )}

                    {step === 2 && (
                        <Box>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                                <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} centered>
                                    <Tab label={<Box className="flex items-center gap-2"><span>Sách Mới</span><Chip label={previewData.newBooks.length} color="success" size="small" /></Box>} />
                                    <Tab label={<Box className="flex items-center gap-2"><span>Sách Đã Có</span><Chip label={previewData.existingBooks.length} color="warning" size="small" /></Box>} />
                                </Tabs>
                            </Box>

                            <Box hidden={tabIndex !== 0}>
                                <Alert severity="success" sx={{ mb: 1 }}>Sách chưa có trong hệ thống.</Alert>
                                <EditableTable 
                                    data={previewData.newBooks} 
                                    onUpdate={(newData) => setPreviewData({...previewData, newBooks: newData})}
                                    onAcceptSuggestion={handleMoveToExisting} // Truyền hàm xử lý chọn Menu
                                />
                            </Box>

                            <Box hidden={tabIndex !== 1}>
                                <Alert severity="warning" sx={{ mb: 1 }}>Sách đã tồn tại. Số lượng sẽ cộng dồn.</Alert>
                                <EditableTable 
                                    data={previewData.existingBooks} 
                                    onUpdate={(newData) => setPreviewData({...previewData, existingBooks: newData})} 
                                />
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Footer giữ nguyên */}
                {step === 2 && (
                    <Box className="p-4 border-t bg-gray-50 flex justify-between rounded-b-lg">
                        <Button onClick={() => setStep(1)} startIcon={<ArrowBack />} variant="outlined">Chọn file khác</Button>
                        <Button onClick={handleConfirm} variant="contained" color="primary" startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <Save />} disabled={isLoading}>
                            {isLoading ? "Đang lưu..." : "Xác nhận Nhập kho"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ImportModal;