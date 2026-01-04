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

// ĐỊNH NGHĨA CHUỖI TRẠNG THÁI
const SHIPPING_STATUS_NEW = "Đã bàn giao cho ĐVVC";
const SHIPPING_STATUS_OLD_SHIPPING = "Đang giao";
const STATUS_PENDING = "Chờ xử lý"; // Trạng thái chờ xác nhận
const STATUS_CONFIRMED = "Đã nhận đơn"; // Trạng thái sau khi xác nhận

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
    const [selectedDeliveryUnitId, setSelectedDeliveryUnitId] = useState(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [deliveryUnitMap, setDeliveryUnitMap] = useState({});
    
    // --- LOGIC MỚI: CHẾ ĐỘ HIỂN THỊ ---
    // Chế độ gán vận chuyển (khi đang ở tab Đã nhận đơn)
    const isAssignmentMode = filterStatus === STATUS_CONFIRMED;
    // Chế độ xác nhận đơn (khi đang ở tab Chờ xử lý)
    const isPendingMode = filterStatus === STATUS_PENDING;
    // Cho phép hiện checkbox khi ở 1 trong 2 chế độ này
    const showCheckboxes = isAssignmentMode || isPendingMode;
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
    }, [page, rowsPerPage, filterStatus, searchQuery]);

    const fetchDeliveryUnits = async () => {
        try {
            const response = await axios.get("http://localhost:8084/api/shipping/delivery-units");
            const units = response.data || [];

            const unitMap = units.reduce((map, unit) => {
                map[unit.accountId] = unit.email;
                return map;
            }, {});
            setDeliveryUnitMap(unitMap);

            setDeliveryUnits(units.map(unit => ({
                id: unit.accountId,
                name: unit.email,
                phoneNumber: unit.phone || 'N/A', 
            })) || []);

        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn vị vận chuyển:", error);
            setDeliveryUnits([]);
            setDeliveryUnitMap({});
        }
    };

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
        setSelectedOrderIds([]); // Reset lựa chọn khi load lại
    }, [fetchInvoices]);

    useEffect(() => {
        fetchCancelRequests();
    }, []);

    const handleSelectInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDrawerOpen(true);
    };

    // --- HÀM MỚI: XÁC NHẬN ĐƠN HÀNG HÀNG LOẠT ---
    const handleBulkConfirmOrders = async () => {
        if (selectedOrderIds.length === 0) {
            alert("Vui lòng chọn ít nhất một đơn hàng để xác nhận.");
            return;
        }

        const confirmMessage = `Bạn có chắc chắn muốn xác nhận ${selectedOrderIds.length} đơn hàng này không?`;
        if (!window.confirm(confirmMessage)) return;

        try {
            // Duyệt qua danh sách ID đã chọn và gọi API update cho từng đơn
            // Giả định API update trạng thái là shippingStatus="Đã nhận đơn"
            const updatePromises = selectedOrderIds.map(orderId =>
                axios.put(`http://localhost:8082/api/orders/update-shipping-status/${orderId}?shippingStatus=${STATUS_CONFIRMED}`)
            );

            await Promise.all(updatePromises);

            alert(`Đã xác nhận thành công ${selectedOrderIds.length} đơn hàng.`);
            setSelectedOrderIds([]); // Reset selection
            fetchInvoices(); // Reload data
        } catch (error) {
            console.error("Lỗi khi xác nhận hàng loạt:", error);
            alert("Có lỗi xảy ra khi xác nhận đơn hàng. Vui lòng thử lại.");
        }
    };
    // ---------------------------------------------

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

    const handleToggleOrderSelect = (orderId) => {
        setSelectedOrderIds(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleOpenDeliveryUnitDialog = (e) => {
        if (e) e.stopPropagation();
        if (selectedOrderIds.length === 0) {
            alert("Vui lòng chọn ít nhất một đơn hàng để gán đơn vị vận chuyển.");
            return;
        }
        setSelectedDeliveryUnitId(null);
        fetchDeliveryUnits(); 
        setIsDeliveryUnitDialogOpen(true);
    };

    const handleCloseDeliveryUnitDialog = () => {
        setIsDeliveryUnitDialogOpen(false);
    };

    const handleSaveDeliveryUnit = async () => {
        if (!selectedDeliveryUnitId || selectedOrderIds.length === 0) {
            alert("Vui lòng chọn đơn hàng và một đơn vị vận chuyển.");
            return;
        }

        try {
            const assignmentPromises = selectedOrderIds.map(orderId =>
                axios.put(
                    `http://localhost:8082/api/orders/assign-delivery-unit/${orderId}`,
                    null,
                    { params: { deliveryUnitId: selectedDeliveryUnitId } }
                )
            );
            await Promise.all(assignmentPromises);

            const updateStatusPromises = selectedOrderIds.map(orderId =>
                axios.put(`http://localhost:8082/api/orders/update-shipping-status/${orderId}?shippingStatus=${SHIPPING_STATUS_NEW}`)
            );
            await Promise.all(updateStatusPromises);

            const assignedUnitName = deliveryUnitMap[selectedDeliveryUnitId] || selectedDeliveryUnitId;
            alert(`Đã gán ĐVVC ${assignedUnitName} cho ${selectedOrderIds.length} đơn hàng.`);
            
            setSelectedOrderIds([]); 
            setSelectedDeliveryUnitId(null); 
            handleCloseDeliveryUnitDialog();
            fetchInvoices(); 
        } catch (error) {
            console.error("Lỗi khi gán đơn vị vận chuyển:", error);
            alert("Lỗi khi gán đơn vị vận chuyển. Vui lòng thử lại.");
        }
    };

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

    const isAllSelected = invoices.length > 0 && selectedOrderIds.length === invoices.length;
    
    const getDisplayShippingStatus = (statusFromApi) => {
        if (statusFromApi === SHIPPING_STATUS_OLD_SHIPPING || statusFromApi === SHIPPING_STATUS_NEW) {
            return SHIPPING_STATUS_NEW;
        }
        return statusFromApi;
    };


    return (
        <div className="flex h-screen overflow-hidden">
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
                    <div className="flex flex-wrap justify-center items-center gap-4 mt-14 mb-4 bg-white p-4 rounded-lg shadow-md">
                        {["", STATUS_PENDING, STATUS_CONFIRMED, SHIPPING_STATUS_NEW, "Đã giao", "Đã hủy"].map((status, index) => (
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

                        {/* --- NÚT MỚI: XÁC NHẬN ĐƠN HÀNG (Hiện khi ở tab Chờ xử lý) --- */}
                        {isPendingMode && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBulkConfirmOrders}
                                disabled={selectedOrderIds.length === 0}
                                sx={{
                                    fontSize: "1rem",
                                    padding: "10px 24px",
                                    minWidth: "200px",
                                    height: "46px",
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Xác nhận đơn ({selectedOrderIds.length})
                            </Button>
                        )}

                        {/* Nút Gán đơn vị vận chuyển (Hiện khi ở tab Đã nhận đơn) */}
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

                        <TextField
                            label="Tìm kiếm hóa đơn"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="!min-w-[250px] h-12"
                        />

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

                    <TableContainer component={Paper} className="flex-1 overflow-y-auto rounded-lg bg-white shadow-md">
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        {/* Hiển thị checkbox select all nếu showCheckboxes = true */}
                                        {showCheckboxes && invoices.length > 0 && (
                                            <Checkbox
                                                checked={isAllSelected}
                                                indeterminate={selectedOrderIds.length > 0 && !isAllSelected}
                                                onChange={() => {
                                                    if (isAllSelected) {
                                                        setSelectedOrderIds([]);
                                                    } else {
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
                                            onClick={() => handleSelectInvoice(invoice)} 
                                            hover
                                            className={isItemSelected ? 'bg-blue-50' : ''}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell padding="checkbox">
                                                {/* Hiển thị checkbox dòng nếu showCheckboxes = true */}
                                                {showCheckboxes ? (
                                                    <Checkbox
                                                        checked={isItemSelected}
                                                        onChange={() => handleToggleOrderSelect(invoice.orderId)}
                                                        onClick={(e) => e.stopPropagation()} 
                                                    />
                                                ) : (
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
                                            <TableCell>{getDisplayShippingStatus(invoice.shippingStatus)}</TableCell> 
                                            <TableCell>
                                                <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
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

                    {/* Pagination */}
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

                {/* Drawer Chi tiết */}
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

                {/* Dialog Chọn ĐVVC */}
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
                                            value={unit.id} 
                                            control={<Radio />}
                                            label={
                                                <ListItemText
                                                    primary={unit.name}
                                                    secondary={`SĐT: ${unit.phoneNumber}`}
                                                />
                                            }
                                            checked={selectedDeliveryUnitId === unit.id} 
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
                            disabled={!selectedDeliveryUnitId} 
                        >
                            Lưu và Chuyển **Đã bàn giao cho ĐVVC** ({selectedOrderIds.length} đơn)
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Drawer Yêu cầu hủy */}
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
                                                        variant="contained" color="success" size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleApproveCancellation(request.id, request.orderId); }}
                                                    >
                                                        Duyệt
                                                    </Button>
                                                    <Button 
                                                        variant="contained" color="error" size="small"
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