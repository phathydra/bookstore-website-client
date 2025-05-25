import React, { useState, useEffect } from "react";
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
} from "@mui/material";

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

    useEffect(() => {
        // Fetch invoices whenever page, rowsPerPage, filterStatus, or searchQuery changes
        fetchInvoices();
    }, [page, rowsPerPage, filterStatus, searchQuery]);

    useEffect(() => {
        // Fetch cancel requests once on component mount or when manually refreshed
        fetchCancelRequests();
    }, []);

    const fetchInvoices = async () => {
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

    const handleSelectInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDrawerOpen(true);
    };

    const handleUpdateStatus = async (updatedInvoice, newStatus) => {
        try {
            await axios.put(`http://localhost:8082/api/orders/update-shipping-status/${updatedInvoice.orderId}?shippingStatus=${newStatus}`);
            fetchInvoices(); // Fetch lại danh sách sau khi cập nhật
            setIsDrawerOpen(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
            alert("Lỗi khi cập nhật trạng thái đơn hàng");
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Luôn về trang 0 khi thay đổi số hàng hiển thị
    };

    const handleFilterClick = (status) => {
        setFilterStatus(status);
        setPage(0); // Luôn về trang 0 khi thay đổi trạng thái lọc
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(0); // Luôn về trang 0 khi thay đổi tìm kiếm
    };

    const handleOpenCancelRequests = () => {
        setIsCancelRequestsOpen(true);
    };

    const handleCloseCancelRequests = () => {
        setIsCancelRequestsOpen(false);
        setSelectedCancelRequest(null);
        fetchCancelRequests(); // Refresh cancel requests sau khi đóng
    };

    const handleSelectCancelRequest = (request) => {
        setSelectedCancelRequest(request);
    };

    const handleApproveCancellation = async (requestId, orderId) => {
        try {
            await axios.put(`http://localhost:8082/api/cancelled-orders/update-status/${requestId}?status=Đồng ý`);
            fetchInvoices(); // Refresh invoices để cập nhật trạng thái đơn hàng bị hủy
            fetchCancelRequests(); // Refresh cancel requests
            setSelectedCancelRequest(null);
        } catch (error) {
            console.error("Lỗi khi duyệt yêu cầu hủy:", error);
            alert("Lỗi khi duyệt yêu cầu hủy");
        }
    };

    const handleRejectCancellation = async (requestId, orderId) => {
        try {
            await axios.put(`http://localhost:8082/api/cancelled-orders/update-status/${requestId}?status=Từ chối`);
            fetchInvoices(); // Refresh invoices để cập nhật trạng thái đơn hàng bị hủy (nếu có)
            fetchCancelRequests(); // Refresh cancel requests
            setSelectedCancelRequest(null);
        } catch (error) {
            console.error("Lỗi khi từ chối yêu cầu hủy:", error);
            alert("Lỗi khi từ chối yêu cầu hủy");
        }
    };

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div
                className={`bg-white shadow-lg fixed h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-1/6'}`}
            >
                <SideNav onToggleCollapse={handleToggleCollapse} />
            </div>

            <main
                className="flex-1 flex flex-col transition-all duration-300 overflow-hidden" // Thêm overflow-hidden
                style={{ marginLeft: isCollapsed ? '5rem' : '16.666667%' }}
            >
                <Header title="QUẢN LÝ HÓA ĐƠN" isCollapsed={isCollapsed} />

                <div className="flex flex-col flex-1 p-4 overflow-y-auto"> {/* Thêm overflow-y-auto ở đây */}
                    {/* Thanh filter + tìm kiếm */}
                    <div className="flex flex-wrap justify-center items-center gap-4 mt-14 mb-4 bg-white p-4 rounded-lg shadow-md">
                        {["", "Chờ xử lý", "Đã nhận đơn", "Đang giao", "Đã giao", "Đã hủy"].map((status, index) => (
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
                                {status === "" ? "Tất cả" : status}
                            </Button>
                        ))}

                        {/* Ô tìm kiếm */}
                        <TextField
                            label="Tìm kiếm hóa đơn"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="!min-w-[250px] h-12"
                        />

                        {/* Nút xem yêu cầu hủy */}
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

                    {/* Bảng hóa đơn - Có thanh cuộn riêng */}
                    <TableContainer component={Paper} className="flex-1 overflow-y-auto rounded-lg bg-white shadow-md"> {/* Thay max-h bằng flex-1 */}
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã hóa đơn</TableCell>
                                    <TableCell>Tên người nhận</TableCell>
                                    <TableCell>Số điện thoại</TableCell>
                                    <TableCell>Địa chỉ</TableCell>
                                    <TableCell>Tổng tiền</TableCell>
                                    <TableCell>Phương thức thanh toán</TableCell>
                                    <TableCell>Ngày đặt hàng</TableCell>
                                    <TableCell>Trạng thái đơn hàng</TableCell>
                                    <TableCell>Trạng thái giao hàng</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.orderId} onClick={() => handleSelectInvoice(invoice)} hover>
                                        <TableCell>{invoice.orderId}</TableCell>
                                        <TableCell>{invoice.recipientName}</TableCell>
                                        <TableCell>{invoice.phoneNumber}</TableCell>
                                        <TableCell>{`${invoice.ward}, ${invoice.district}, ${invoice.city}, ${invoice.country}`}</TableCell>
                                        <TableCell>{invoice.totalPrice} VND</TableCell>
                                        <TableCell>{invoice.paymentMethod}</TableCell>
                                        <TableCell>{new Date(invoice.dateOrder).toLocaleString()}</TableCell>
                                        <TableCell>{invoice.orderStatus}</TableCell>
                                        <TableCell>{invoice.shippingStatus}</TableCell>
                                    </TableRow>
                                ))}
                                {invoices.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            Không có hóa đơn nào được tìm thấy.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <div className="flex justify-end pr-6 pb-4 bg-white rounded-b-lg shadow-md mt-4"> {/* Thêm background, shadow, và margin-top */}
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

                {/* Drawer hiển thị chi tiết hóa đơn */}
                <Drawer
                    anchor="right"
                    open={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    sx={{ width: 400, "& .MuiDrawer-paper": { width: 600, boxSizing: "border-box" } }}
                >
                    <InvoiceDetail selectedInvoice={selectedInvoice} onUpdateStatus={handleUpdateStatus} onCloseDrawer={() => setIsDrawerOpen(false)} />
                </Drawer>

                {/* Drawer hiển thị danh sách yêu cầu hủy */}
                <Drawer
                    anchor="right"
                    open={isCancelRequestsOpen}
                    onClose={handleCloseCancelRequests}
                    sx={{ width: 500, "& .MuiDrawer-paper": { width: 500, boxSizing: "border-box" } }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Danh sách yêu cầu hủy đơn
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mã đơn hàng</TableCell>
                                        <TableCell>Lý do hủy</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell>Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cancelRequests.map((request) => (
                                        <TableRow
                                            key={request.id}
                                            hover
                                            onClick={() => handleSelectCancelRequest(request)}
                                            className={selectedCancelRequest?.id === request.id ? "bg-gray-100" : ""}
                                        >
                                            <TableCell>{request.orderId}</TableCell>
                                            <TableCell>{request.cancellationReason}</TableCell>
                                            <TableCell>{request.cancellationStatus}</TableCell>
                                            <TableCell>
                                                {request.cancellationStatus === "Yêu cầu hủy đơn" && (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleApproveCancellation(request.id, request.orderId)}
                                                        >
                                                            Duyệt
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleRejectCancellation(request.id, request.orderId)}
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    </>
                                                )}
                                                {request.cancellationStatus !== "Yêu cầu hủy đơn" && (
                                                    <Typography variant="caption">{request.cancellationStatus}</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cancelRequests.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">Không có yêu cầu hủy nào.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button onClick={handleCloseCancelRequests}>Đóng</Button>
                        </Box>
                    </Box>
                </Drawer>
            </main>
        </div>
    );
};

export default InvoiceManagement;