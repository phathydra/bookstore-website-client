import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";
import InvoiceDetail from "./InvoiceDetail";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    Drawer,
    TablePagination,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Radio,
    FormControlLabel,
    Checkbox,
} from "@mui/material";

// ĐỊNH NGHĨA CHUỖI TRẠNG THÁI MỚI VÀ CŨ
const SHIPPING_STATUS_NEW = "Đã bàn giao cho ĐVVC";
const SHIPPING_STATUS_OLD_SHIPPING = "Đang giao"; // Trạng thái này vẫn có thể tồn tại nếu không được gán ĐVVC

const InvoiceManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [totalInvoices, setTotalInvoices] = useState(0);
    const [filterStatus, setFilterStatus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [cancelRequests, setCancelRequests] = useState([]);
    const [isCancelRequestsOpen, setIsCancelRequestsOpen] = useState(false);
    const [selectedCancelRequest, setSelectedCancelRequest] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // --- CÁC STATE cho chức năng Đơn vị vận chuyển ---
    const [deliveryUnits, setDeliveryUnits] = useState([]);
    const [isDeliveryUnitDialogOpen, setIsDeliveryUnitDialogOpen] = useState(false);
    const [selectedDeliveryUnitId, setSelectedDeliveryUnitId] = useState(null); // ID của đơn vị vận chuyển được chọn
    const [selectedOrderIds, setSelectedOrderIds] = useState([]); // IDs của các đơn hàng được chọn
    const [deliveryUnitMap, setDeliveryUnitMap] = useState({}); // Map: { id: name }
    
    // Biến cờ chỉ khi filterStatus là "Đã nhận đơn" (chờ gán ĐVVC)
    const isAssignmentMode = filterStatus === "Đã nhận đơn";
    // --------------------------------------------------

    const fetchInvoices = useCallback(async () => {
        try {
            const params = {
                page: page,
                size: rowsPerPage,
            };
            if (filterStatus) {
                params.shippingStatus = filterStatus;
            }
            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await axios.get("http://localhost:8082/api/orders", { params });
            setInvoices(response.data.content || []);
            setTotalInvoices(response.data.totalElements || 0);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hóa đơn:", error);
            setInvoices([]);
            setTotalInvoices(0);
        }
    }, [page, rowsPerPage, filterStatus, searchQuery]); // Thêm dependencies

    // --- Hàm: Lấy danh sách đơn vị vận chuyển và tạo Map (Giữ nguyên) ---
    const fetchDeliveryUnits = async () => {
        try {
            // Lấy danh sách các tài khoản Shipping có Role là DeliveryUnit
            const response = await axios.get("http://localhost:8084/api/shipping/delivery-units");
            const units = response.data || [];

            // 1. Tạo Map: { id: name } (LƯU Ý: id ở đây là accountId)
            const unitMap = units.reduce((map, unit) => {
                map[unit.accountId] = unit.email; // Hoặc sử dụng unit.name
                return map;
            }, {});
            setDeliveryUnitMap(unitMap);

            // 2. Lưu danh sách đơn vị để hiển thị trong Dialog
            setDeliveryUnits(units.map(unit => ({
                id: unit.accountId, // SỬ DỤNG accountId LÀM ID CHÍNH XÁC
                name: unit.email,
                phoneNumber: unit.phone || 'N/A', 
            })) || []);

        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn vị vận chuyển:", error);
            setDeliveryUnits([]);
            setDeliveryUnitMap({});
        }
    };
    // ----------------------------------------------------

    const fetchCancelRequests = async () => {
        try {
            const response = await axios.get("http://localhost:8082/api/cancelled-orders");
            setCancelRequests(response.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách yêu cầu hủy:", error);
            setCancelRequests([]);
        }
    };


    useEffect(() => {
        fetchInvoices();
        fetchDeliveryUnits(); 

        // Reset lựa chọn khi thay đổi trạng thái lọc
        setSelectedOrderIds([]); 
    }, [fetchInvoices]); // Sử dụng fetchInvoices đã được bọc trong useCallback

    useEffect(() => {
        fetchCancelRequests();
    }, []);

    // Hàm mở chi tiết hóa đơn (chỉ được gọi khi click vào row)
    const handleSelectInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDrawerOpen(true);
    };

    const handleUpdateStatus = async (updatedInvoice, newStatus) => {
        try {
            await axios.put(`http://localhost:8082/api/orders/update-shipping-status/${updatedInvoice.orderId}?shippingStatus=${newStatus}`);
            fetchInvoices();
            setIsDrawerOpen(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
            alert("Lỗi khi cập nhật trạng thái đơn hàng");
        }
    };

    // --- Hàm Xử lý chọn/bỏ chọn đơn hàng (Checkbox) (Giữ nguyên) ---
    const handleToggleOrderSelect = (orderId) => {
        setSelectedOrderIds(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId) // Bỏ chọn
                : [...prev, orderId] // Chọn
        );
    };

    // --- Hàm Xử lý mở Dialog chọn Đơn vị vận chuyển (Giữ nguyên) ---
    const handleOpenDeliveryUnitDialog = (e) => {
        if (e) e.stopPropagation();

        if (selectedOrderIds.length === 0) {
            alert("Vui lòng chọn ít nhất một đơn hàng để gán đơn vị vận chuyển.");
            return;
        }

        // Reset selectedDeliveryUnitId khi mở dialog gán hàng loạt
        setSelectedDeliveryUnitId(null);
        
        fetchDeliveryUnits(); 
        setIsDeliveryUnitDialogOpen(true);
    };

    const handleCloseDeliveryUnitDialog = () => {
        setIsDeliveryUnitDialogOpen(false);
    };

    /**
     * HÀM QUAN TRỌNG ĐÃ CHỈNH SỬA
     * 1. Gán đơn vị vận chuyển (assign-delivery-unit)
     * 2. Cập nhật trạng thái giao hàng thành "Đã bàn giao cho ĐVVC"
     */
    const handleSaveDeliveryUnit = async () => {
        if (!selectedDeliveryUnitId || selectedOrderIds.length === 0) {
            alert("Vui lòng chọn đơn hàng và một đơn vị vận chuyển.");
            return;
        }

        try {
            // 1. Gán đơn vị vận chuyển
            const assignmentPromises = selectedOrderIds.map(orderId =>
                axios.put(
                    `http://localhost:8082/api/orders/assign-delivery-unit/${orderId}`,
                    null,
                    {
                        params: {
                            deliveryUnitId: selectedDeliveryUnitId 
                        }
                    }
                )
            );

            await Promise.all(assignmentPromises);

            // 2. Cập nhật trạng thái thành "Đã bàn giao cho ĐVVC"
            const updateStatusPromises = selectedOrderIds.map(orderId =>
                axios.put(`http://localhost:8082/api/orders/update-shipping-status/${orderId}?shippingStatus=${SHIPPING_STATUS_NEW}`)
            );
            
            await Promise.all(updateStatusPromises);

            const assignedUnitName = deliveryUnitMap[selectedDeliveryUnitId] || selectedDeliveryUnitId;
            alert(`Đã gán thành công đơn vị vận chuyển ${assignedUnitName} và chuyển trạng thái thành "${SHIPPING_STATUS_NEW}" cho ${selectedOrderIds.length} đơn hàng.`);
            
            // Reset state sau khi thành công
            setSelectedOrderIds([]); 
            setSelectedDeliveryUnitId(null); 
            handleCloseDeliveryUnitDialog();
            fetchInvoices(); // Load lại danh sách hóa đơn
        } catch (error) {
            console.error("Lỗi khi gán đơn vị vận chuyển và cập nhật trạng thái:", error);
            alert("Lỗi khi gán đơn vị vận chuyển và cập nhật trạng thái. Vui lòng thử lại.");
        }
    };
    // ---------------------------------------------------------

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); 
    };

    const handleFilterClick = (status) => {
        setFilterStatus(status);
        setPage(0); 
        setSelectedOrderIds([]); 
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(0); 
    };
    
    // Giữ nguyên các hàm xử lý Yêu cầu hủy và Toggle Collapse

    const handleOpenCancelRequests = () => {
        setIsCancelRequestsOpen(true);
    };

    const handleCloseCancelRequests = () => {
        setIsCancelRequestsOpen(false);
        setSelectedCancelRequest(null);
        fetchCancelRequests();
    };

    const handleSelectCancelRequest = (request) => {
        setSelectedCancelRequest(request);
    };

    const handleApproveCancellation = async (requestId, orderId) => {
        try {
            await axios.put(`http://localhost:8082/api/cancelled-orders/update-status/${requestId}?status=Đồng ý`);
            fetchInvoices();
            fetchCancelRequests();
            setSelectedCancelRequest(null);
        } catch (error) {
            console.error("Lỗi khi duyệt yêu cầu hủy:", error);
            alert("Lỗi khi duyệt yêu cầu hủy");
        }
    };

    const handleRejectCancellation = async (requestId, orderId) => {
        try {
            await axios.put(`http://localhost:8082/api/cancelled-orders/update-status/${requestId}?status=Từ chối`);
            fetchInvoices();
            fetchCancelRequests();
            setSelectedCancelRequest(null);
        } catch (error) {
            console.error("Lỗi khi từ chối yêu cầu hủy:", error);
            alert("Lỗi khi từ chối yêu cầu hủy");
        }
    };

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Biến tính toán cho Checkbox "chọn tất cả"
    // Chỉ tính các đơn trên trang hiện tại
    const isAllSelected = invoices.length > 0 && selectedOrderIds.length === invoices.length;
    
    /**
     * Hàm helper để hiển thị tên trạng thái giao hàng đúng trên UI
     * @param {string} statusFromApi Trạng thái từ API
     * @returns {string} Trạng thái hiển thị
     */
    const getDisplayShippingStatus = (statusFromApi) => {
        // Nếu trạng thái từ API là 'Đang giao' (trạng thái cũ) hoặc trạng thái mới
        if (statusFromApi === SHIPPING_STATUS_OLD_SHIPPING || statusFromApi === SHIPPING_STATUS_NEW) {
            return SHIPPING_STATUS_NEW; // Hiển thị chung là "Đã bàn giao cho ĐVVC"
        }
        return statusFromApi;
    };


    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar (Giữ nguyên) */}
            <div
                className={`bg-white shadow-lg fixed h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-1/6'}`}
            >
                <SideNav onToggleCollapse={handleToggleCollapse} />
            </div>

            <main
                className="flex-1 flex flex-col transition-all duration-300 overflow-hidden"
                style={{ marginLeft: isCollapsed ? '5rem' : '16.666667%' }}
            >
                <Header title="QUẢN LÝ HÓA ĐƠN" isCollapsed={isCollapsed} />

                <div className="flex flex-col flex-1 p-4 overflow-y-auto">
                    {/* Thanh filter + tìm kiếm + Gán ĐVVC (ĐÃ SỬA TÊN HIỂN THỊ) */}
                    <div className="flex flex-wrap justify-center items-center gap-4 mt-14 mb-4 bg-white p-4 rounded-lg shadow-md">
                        {["", "Chờ xử lý", "Đã nhận đơn", SHIPPING_STATUS_NEW, "Đã giao", "Đã hủy"].map((status, index) => (
                            <Button
                                key={index}
                                variant={filterStatus === status ? "contained" : "outlined"}
                                color={filterStatus === status ? "primary" : "default"}
                                sx={{
                                    fontSize: "1rem",
                                    padding: "10px 24px",
                                    minWidth: "178px",
                                    height: "46px",
                                }}
                                onClick={() => handleFilterClick(status)}
                            >
                                {status === "" ? "Tất cả" : status === SHIPPING_STATUS_NEW ? "Đã bàn giao cho ĐVVC" : status}
                            </Button>
                        ))}

                        {/* Nút Gán đơn vị vận chuyển */}
                        {isAssignmentMode && (
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleOpenDeliveryUnitDialog}
                                disabled={selectedOrderIds.length === 0}
                                sx={{
                                    fontSize: "1rem",
                                    padding: "10px 24px",
                                    minWidth: "200px",
                                    height: "46px",
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Gán ĐV Vận Chuyển ({selectedOrderIds.length})
                            </Button>
                        )}

                        {/* Ô tìm kiếm (Giữ nguyên) */}
                        <TextField
                            label="Tìm kiếm hóa đơn"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="!min-w-[250px] h-12"
                        />

                        {/* Nút xem yêu cầu hủy (Giữ nguyên) */}
                        <Button
                            variant="outlined"
                            onClick={handleOpenCancelRequests}
                            sx={{
                                fontSize: "1rem",
                                padding: "10px 24px",
                                minWidth: "178px",
                                height: "46px",
                            }}
                        >
                            Yêu cầu hủy ({cancelRequests.length})
                        </Button>
                    </div>

                    {/* Bảng hóa đơn */}
                    <TableContainer component={Paper} className="flex-1 overflow-y-auto rounded-lg bg-white shadow-md">
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        {/* Checkbox chọn tất cả */}
                                        {isAssignmentMode && invoices.length > 0 && (
                                            <Checkbox
                                                checked={isAllSelected}
                                                indeterminate={selectedOrderIds.length > 0 && !isAllSelected}
                                                onChange={() => {
                                                    if (isAllSelected) {
                                                        setSelectedOrderIds([]);
                                                    } else {
                                                        // Chọn tất cả các đơn trên trang hiện tại
                                                        setSelectedOrderIds(invoices.map(i => i.orderId));
                                                    }
                                                }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>Mã hóa đơn</TableCell>
                                    <TableCell>Tên người nhận</TableCell>
                                    <TableCell>Số điện thoại</TableCell>
                                    <TableCell>Địa chỉ</TableCell>
                                    <TableCell>Tổng tiền</TableCell>
                                    <TableCell>Phương thức thanh toán</TableCell>
                                    <TableCell>Ngày đặt hàng</TableCell>
                                    <TableCell>Trạng thái đơn hàng</TableCell>
                                    <TableCell>Trạng thái giao hàng</TableCell>
                                    <TableCell>ĐV Vận Chuyển</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invoices.map((invoice) => {
                                    const isItemSelected = selectedOrderIds.includes(invoice.orderId);
                                    const deliveryUnitName = deliveryUnitMap[invoice.deliveryUnitId];

                                    return (
                                        <TableRow 
                                            key={invoice.orderId} 
                                            // Luôn gọi handleSelectInvoice khi click vào hàng
                                            onClick={() => handleSelectInvoice(invoice)} 
                                            hover
                                            className={isItemSelected ? 'bg-blue-50' : ''}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            {/* Cột Checkbox */}
                                            <TableCell padding="checkbox">
                                                {isAssignmentMode ? (
                                                    <Checkbox
                                                        checked={isItemSelected}
                                                        onChange={() => handleToggleOrderSelect(invoice.orderId)}
                                                        // NGĂN CHẶN sự kiện này lan truyền lên sự kiện click hàng
                                                        onClick={(e) => e.stopPropagation()} 
                                                    />
                                                ) : (
                                                    // Placeholder rỗng nếu không phải tab "Đã nhận đơn"
                                                    <Box sx={{ width: 18 }} />
                                                )}
                                            </TableCell>
                                            <TableCell>{invoice.orderId}</TableCell>
                                            <TableCell>{invoice.recipientName}</TableCell>
                                            <TableCell>{invoice.phoneNumber}</TableCell>
                                            <TableCell>{`${invoice.ward}, ${invoice.district}, ${invoice.city}, ${invoice.country}`}</TableCell>
                                            <TableCell>{invoice.totalPrice} VND</TableCell>
                                            <TableCell>{invoice.paymentMethod}</TableCell>
                                            <TableCell>{new Date(invoice.dateOrder).toLocaleString()}</TableCell>
                                            <TableCell>{invoice.orderStatus}</TableCell>
                                            
                                            {/* SỬ DỤNG HÀM HIỂN THỊ TRẠNG THÁI MỚI */}
                                            <TableCell>{getDisplayShippingStatus(invoice.shippingStatus)}</TableCell> 
                                            
                                            {/* Cột cho ĐV Vận Chuyển */}
                                            <TableCell>
                                                <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                                                    {/* Hiển thị tên (từ Map) hoặc ID nếu không tìm thấy tên */}
                                                    {deliveryUnitName || (invoice.deliveryUnitId ? invoice.deliveryUnitId : "-")} 
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {invoices.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center">
                                            Không có hóa đơn nào được tìm thấy.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination (Giữ nguyên) */}
                    <div className="flex justify-end pr-6 pb-4 bg-white rounded-b-lg shadow-md mt-4">
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={totalInvoices}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </div>
                </div>

                {/* Drawer hiển thị chi tiết hóa đơn (Giữ nguyên) */}
                <Drawer
                    anchor="right"
                    open={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    sx={{ width: 400, "& .MuiDrawer-paper": { width: 600, boxSizing: "border-box" } }}
                >
                    <InvoiceDetail 
                        selectedInvoice={selectedInvoice} 
                        onUpdateStatus={handleUpdateStatus} 
                        onCloseDrawer={() => setIsDrawerOpen(false)} 
                    />
                </Drawer>

                {/* Dialog CHỌN Đơn vị vận chuyển (ĐÃ SỬA NÚT LƯU) */}
                <Dialog open={isDeliveryUnitDialogOpen} onClose={handleCloseDeliveryUnitDialog} fullWidth maxWidth="sm">
                    <DialogTitle>
                        Gán Đơn Vị Vận Chuyển cho {selectedOrderIds.length} Đơn hàng
                    </DialogTitle>
                    <DialogContent dividers>
                        {deliveryUnits.length > 0 ? (
                            <List>
                                {deliveryUnits.map((unit) => (
                                    <ListItem key={unit.id} disablePadding>
                                        <FormControlLabel
                                            // value là ID chính xác (accountId) để truyền đi
                                            value={unit.id} 
                                            control={<Radio />}
                                            label={
                                                <ListItemText
                                                    primary={unit.name}
                                                    secondary={`SĐT: ${unit.phoneNumber}`}
                                                />
                                            }
                                            // KIỂM TRA ĐÚNG ID ĐÃ CHỌN
                                            checked={selectedDeliveryUnitId === unit.id} 
                                            // LƯU ID VÀO STATE
                                            onChange={() => setSelectedDeliveryUnitId(unit.id)} 
                                            sx={{ width: '100%', m: 0, p: 1 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography>Không có đơn vị vận chuyển nào được tìm thấy.</Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeliveryUnitDialog} color="error">Hủy</Button>
                        <Button
                            onClick={handleSaveDeliveryUnit}
                            color="primary"
                            variant="contained"
                            // Chỉ cần kiểm tra selectedDeliveryUnitId có giá trị (ID) hay chưa
                            disabled={!selectedDeliveryUnitId} 
                        >
                            Lưu và Chuyển **Đã bàn giao cho ĐVVC** ({selectedOrderIds.length} đơn)
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Drawer hiển thị danh sách yêu cầu hủy (Giữ nguyên) */}
                <Drawer
                    anchor="right"
                    open={isCancelRequestsOpen}
                    onClose={handleCloseCancelRequests}
                    sx={{ width: 500, "& .MuiDrawer-paper": { width: 500, boxSizing: "border-box" } }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>Yêu cầu hủy đơn hàng</Typography>
                        {cancelRequests.length === 0 ? (
                            <Typography>Không có yêu cầu hủy nào.</Typography>
                        ) : (
                            <List>
                                {cancelRequests.map(request => (
                                    <ListItem 
                                        key={request.orderId} 
                                        secondaryAction={
                                            request.status === 'Chờ xử lý' && (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button 
                                                        variant="contained" 
                                                        color="success" 
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleApproveCancellation(request.id, request.orderId); }}
                                                    >
                                                        Duyệt
                                                    </Button>
                                                    <Button 
                                                        variant="contained" 
                                                        color="error" 
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleRejectCancellation(request.id, request.orderId); }}
                                                    >
                                                        Từ chối
                                                    </Button>
                                                </Box>
                                            )
                                        }
                                        sx={{ 
                                            borderBottom: '1px solid #eee', 
                                            mb: 1, 
                                            cursor: 'pointer', 
                                            backgroundColor: request.id === selectedCancelRequest?.id ? '#f0f0f0' : 'inherit'
                                        }}
                                        onClick={() => handleSelectCancelRequest(request)}
                                    >
                                        <ListItemText
                                            primary={`Mã đơn: ${request.orderId} - Trạng thái: ${request.status}`}
                                            secondary={`Lý do: ${request.reason || 'Không có'}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        
                        {selectedCancelRequest && (
                            <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
                                <Typography variant="subtitle1" fontWeight="bold">Chi tiết đơn hàng bị hủy:</Typography>
                                <Typography>Mã đơn: {selectedCancelRequest.orderId}</Typography>
                                <Typography>Lý do: {selectedCancelRequest.reason}</Typography>
                                <Typography>Trạng thái: {selectedCancelRequest.status}</Typography>
                            </Paper>
                        )}
                    </Box>
                </Drawer>
            </main>
        </div>
    );
};

export default InvoiceManagement;