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
} from "@mui/material";

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, [page, rowsPerPage]);

  useEffect(() => {
    filterInvoices();
  }, [invoices, filterStatus, searchQuery]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8082/api/orders?page=${page}&size=${rowsPerPage}`
      );
      setInvoices(response.data.content || []);
      setTotalInvoices(response.data.totalElements || 0);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;
    if (filterStatus) {
      filtered = filtered.filter((invoice) => invoice.shippingStatus === filterStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.orderId.toString().includes(searchQuery)
      );
    }
    setFilteredInvoices(filtered);
  };

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDrawerOpen(true);
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
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/6 bg-white shadow-lg fixed h-full">
        <SideNav />
      </div>

      <main className="flex-1 flex flex-col pl-[16%] bg-gray-100 h-screen" >
        <Header title="Invoice Management" />

        <div className="flex flex-col flex-1 p-4">
          {/* 🔥 Thanh filter + tìm kiếm */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-14 mb-4 bg-white p-4 rounded-lg shadow-md">
            {["", "Chờ xử lý", "Đã nhận đơn", "Đang giao", "Đã giao"].map((status, index) => (
              <Button
                key={index}
                variant={filterStatus === status ? "contained" : "outlined"}
                color={filterStatus === status ? "primary" : "default"}
                sx={{
                  fontSize: "1rem",  // Cỡ chữ lớn hơn
                  padding: "10px 24px", // Padding chuẩn
                  minWidth: "178px", // Độ rộng tối thiểu
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!min-w-[250px] h-12"
            />
          </div>

          {/* 🔥 Bảng hóa đơn - Có thanh cuộn riêng */}
          <TableContainer component={Paper} className="max-h-[70vh] overflow-y-auto rounded-lg bg-white shadow-md">
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
                {filteredInvoices.map((invoice) => (
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
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div className="mt-auto flex justify-end pr-6 pb-4">
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

        {/* 🔥 Drawer hiển thị chi tiết hóa đơn */}
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{ width: 400, "& .MuiDrawer-paper": { width: 600, boxSizing: "border-box" } }}
        >
          <InvoiceDetail selectedInvoice={selectedInvoice} />
        </Drawer>
      </main>
    </div>
  );
};

export default InvoiceManagement;
