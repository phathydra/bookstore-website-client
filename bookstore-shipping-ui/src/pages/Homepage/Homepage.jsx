import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Radio, FormControlLabel, Checkbox, Menu, MenuItem } from '@mui/material';
import DeliveryUnitHeader from '../DeliveryUnitHeader'; // Import component mới

// --- HẰNG SỐ TRẠNG THÁI & API ---
const SHIPPING_STATUS_ASSIGNMENT = "Đã bàn giao cho ĐVVC";
const SHIPPING_STATUS_SHIPPING = "Đang giao";
const SHIPPING_STATUS_DELIVERED = "Đã giao thành công";

const apiUrl = "http://localhost:8082";
const shippingApiUrl = "http://localhost:8084"; 
const userId = localStorage.getItem("accountId") || "N/A";

// --- INLINE SVG ICONS (Giữ lại các icons còn lại, loại bỏ IconMapPin nếu đã tách hoàn toàn) ---
// IconMapPin được chuyển sang DeliveryUnitHeader, nhưng ta vẫn giữ lại định nghĩa này ở đây để đảm bảo các chỗ khác trong JSX không bị lỗi.
const IconMapPin = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>);
const IconChartLine = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 5.29-5.29L22 12V6z" /></svg>);
const IconClipboardList = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12H9v2h6v-2zm-6-4h6v2H9V8zm12-4h-4.5c-.3-1.1-1.35-2-2.5-2s-2.2.9-2.5 2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-2 16H3V6h2v3c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h2v14z" /></svg>);
const IconTruck = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v6h2a2 2 0 002 2h12a2 2 0 002-2h2v-6c0-1.1-.9-2-2-2zm-5 0V6h2v2h-2zm-6 0V6h2v2h-2zM4 12h16v4h-2a2 2 0 00-2 2H8a2 2 0 00-2-2H4v-4z" /></svg>);
const IconCheckCircle = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>);
const IconUserCheck = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>);

// --- COMPONENT CHIP TRẠNG THÁI ---
const StatusChip = ({ status }) => {
    let colorClass, text;
    switch (status) {
        case SHIPPING_STATUS_ASSIGNMENT:
            [colorClass, text] = ["bg-yellow-100 text-yellow-800 border-yellow-300", SHIPPING_STATUS_ASSIGNMENT]; break;
        case SHIPPING_STATUS_SHIPPING:
            [colorClass, text] = ["bg-blue-100 text-blue-800 border-blue-300", SHIPPING_STATUS_SHIPPING]; break;
        case SHIPPING_STATUS_DELIVERED:
            [colorClass, text] = ["bg-green-100 text-green-800 border-green-300", 'Đã giao']; break;
        default:
            [colorClass, text] = ["bg-gray-100 text-gray-800 border-gray-300", status || 'Không rõ'];
    }
    return (<span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${colorClass}`}>{text}</span>);
};

// --- COMPONENT CHÍNH ---
const DeliveryUnitDashboard = () => {
    const navigate = useNavigate();

    // Gộp các state liên quan
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState([
        { key: 'total', icon: IconClipboardList, title: "Tổng đơn hàng", value: 0, color: "text-indigo-600", bg: "bg-indigo-50" },
        { key: 'shipping', icon: IconTruck, title: "Đơn đang xử lý / Đang giao", value: 0, color: "text-blue-600", bg: "bg-blue-50" },
        { key: 'delivered', icon: IconCheckCircle, title: "Đã giao thành công", value: 0, color: "text-green-600", bg: "bg-green-50" },
    ]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [pagination, setPagination] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 1 });
    
    // States cho chức năng gán shipper
    const [shippers, setShippers] = useState([]);
    const [isShipperDialogOpen, setIsShipperDialogOpen] = useState(false);
    const [selectedShipperId, setSelectedShipperId] = useState(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [shipperMap, setShipperMap] = useState({});

    // --- menu state ---
    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleGoToInfo = () => {
        handleMenuClose();
        navigate('/DeliveryUnitInfo');
    };
    const handleLogout = () => { 
        handleMenuClose();
        localStorage.removeItem("accountId"); 
        localStorage.removeItem("role"); 
        navigate('/'); 
    };

    // --- HÀM CẬP NHẬT THỐNG KÊ ---
    const updateStats = useCallback((newOrders, totalElements) => {
        let shippingCount = 0;
        let deliveredCount = 0;

        newOrders.forEach(order => {
            if ([SHIPPING_STATUS_ASSIGNMENT, SHIPPING_STATUS_SHIPPING].includes(order.shippingStatus)) {
                shippingCount++;
            } else if (order.shippingStatus === SHIPPING_STATUS_DELIVERED) {
                deliveredCount++;
            }
        });

        setStats(prevStats => prevStats.map(stat => {
            if (stat.key === 'total') return { ...stat, value: totalElements };
            if (stat.key === 'shipping') return { ...stat, value: shippingCount };
            if (stat.key === 'delivered') return { ...stat, value: deliveredCount };
            return stat;
        }));
    }, []);

    // --- HÀM TẢI ĐƠN HÀNG ---
    const fetchOrders = useCallback(async (page = 0, size = 10) => {
        setLoading(true);
        setApiError(null);
        if (userId === "N/A") { setApiError("Không tìm thấy ID đơn vị vận chuyển."); setLoading(false); return; }

        try {
            const response = await axios.get(`${apiUrl}/api/orders/delivery-unit/${userId}`, { params: { page, size } });
            const { content: newOrders = [], pageable: { pageNumber = 0, pageSize = 10 } = {}, totalElements = 0, totalPages = 1 } = response.data;

            setOrders(newOrders);
            setPagination({ pageNumber, pageSize, totalElements, totalPages });
            updateStats(newOrders, totalElements);
            
            // Lọc lại các đơn đã chọn để chỉ giữ lại đơn có thể gán
            setSelectedOrderIds(prevIds => 
                prevIds.filter(id => {
                    const order = newOrders.find(o => o.orderId === id);
                    return order && order.shippingStatus === SHIPPING_STATUS_ASSIGNMENT; 
                })
            );

        } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error);
            setApiError("Không thể kết nối hoặc tải dữ liệu đơn hàng.");
        } finally {
            setLoading(false);
        }
    }, [updateStats]);

    // --- HÀM TẢI SHIPPER ---
    const fetchShippers = async () => {
        try {
            const response = await axios.get(`${shippingApiUrl}/api/shipping/shippers?deliveryUnitId=${userId}`);
            const units = response.data || [];
            const unitMap = units.reduce((map, unit) => ({ ...map, [unit.accountId]: unit.email }), {});
            
            setShipperMap(unitMap);
            setShippers(units.map(unit => ({ id: unit.accountId, name: unit.email, phoneNumber: unit.phone || 'N/A' })) || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Shipper:", error);
            setShippers([]); setShipperMap({});
        }
    };


    // --- các hàm xử lý còn lại ---
    const handleToggleOrderSelect = (orderId) => {
        const orderToToggle = orders.find(o => o.orderId === orderId);
        if (!orderToToggle || orderToToggle.shippingStatus !== SHIPPING_STATUS_ASSIGNMENT) {
            alert(`Đơn hàng ${orderId.substring(0, 8)}... không thể gán shipper vì đang ở trạng thái "${orderToToggle?.shippingStatus}".`);
            return;
        }

        setSelectedOrderIds(prev => 
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };
    const handleToggleSelectAll = () => {
        const assignableOrdersOnPage = orders.filter(order => order.shippingStatus === SHIPPING_STATUS_ASSIGNMENT);
        const isAllAssignableSelected = assignableOrdersOnPage.length > 0 && selectedOrderIds.length === assignableOrdersOnPage.length;
        setSelectedOrderIds(isAllAssignableSelected ? [] : assignableOrdersOnPage.map(i => i.orderId));
    };
    const handleOpenShipperDialog = () => {
        const assignableSelected = selectedOrderIds.filter(id => orders.find(o => o.orderId === id)?.shippingStatus === SHIPPING_STATUS_ASSIGNMENT);
        if (assignableSelected.length === 0) {
            alert(`Vui lòng chọn ít nhất một đơn hàng ở trạng thái "${SHIPPING_STATUS_ASSIGNMENT}" để gán shipper.`);
            return;
        }
        setSelectedOrderIds(assignableSelected);
        setSelectedShipperId(null);
        fetchShippers();
        setIsShipperDialogOpen(true);
    };
    const handleCloseShipperDialog = () => setIsShipperDialogOpen(false);

    const handleSaveShipperAssignment = async () => {
        if (!selectedShipperId || selectedOrderIds.length === 0) {
            alert("Vui lòng chọn đơn hàng và một shipper.");
            return;
        }
        try {
            await Promise.all(selectedOrderIds.map(orderId =>
                axios.put(`${apiUrl}/api/orders/assign-shipper/${orderId}`, null, { params: { shipperId: selectedShipperId } })
            ));
            await Promise.all(selectedOrderIds.map(orderId =>
                axios.put(`${apiUrl}/api/orders/update-shipping-status/${orderId}`, null, { 
                    params: { shippingStatus: SHIPPING_STATUS_SHIPPING } 
                })
            ));
            const assignedShipperName = shipperMap[selectedShipperId] || selectedShipperId;
            alert(`Đã gán thành công shipper ${assignedShipperName} và chuyển trạng thái thành "${SHIPPING_STATUS_SHIPPING}" cho ${selectedOrderIds.length} đơn hàng.`);
            setSelectedOrderIds([]);
            setSelectedShipperId(null);
            handleCloseShipperDialog(); 
            fetchOrders(pagination.pageNumber, pagination.pageSize);
        } catch (error) {
            console.error("Lỗi khi gán shipper hoặc cập nhật trạng thái:", error);
            alert("Lỗi khi gán shipper hoặc cập nhật trạng thái. Vui lòng thử lại.");
        }
    };

    const handleViewDetails = (orderId) => { alert(`Xem chi tiết đơn hàng: ${orderId}`); };
    const handlePageChange = (newPage) => { fetchOrders(newPage, pagination.pageSize); };

    useEffect(() => {
        if (localStorage.getItem("role") !== 'DeliveryUnit') {
            navigate('/');
        } else {
            fetchOrders(pagination.pageNumber, pagination.pageSize);
        }
    }, [navigate, fetchOrders, pagination.pageNumber, pagination.pageSize]);

    const assignableOrdersOnPage = orders.filter(order => order.shippingStatus === SHIPPING_STATUS_ASSIGNMENT);
    const isAllAssignableSelected = assignableOrdersOnPage.length > 0 && selectedOrderIds.length === assignableOrdersOnPage.length;

    // --- JSX (giao diện) ---
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            
            {/* Sử dụng component Header đã tách */}
            <DeliveryUnitHeader
                userId={userId}
                anchorEl={anchorEl}
                handleMenuOpen={handleMenuOpen}
                handleMenuClose={handleMenuClose}
                handleGoToInfo={handleGoToInfo}
                handleLogout={handleLogout}
            />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                
                {/* Phần 1: Thống kê tổng quan */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><IconChartLine className="mr-2 text-indigo-500 h-5 w-5" /> Thống kê hoạt động</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {stats.map((stat, index) => (
                            <div key={index} className={`p-6 ${stat.bg} rounded-xl shadow-lg border-l-4 border-${stat.color.split('-')[1]}-400 transform transition duration-300 hover:scale-[1.02]`}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-500 truncate">{stat.title}</p>
                                    <stat.icon className={`text-2xl ${stat.color} h-6 w-6`} />
                                </div>
                                <div className="mt-1"><p className="text-3xl font-extrabold text-gray-900">{stat.value.toLocaleString('vi-VN')}</p></div>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* NÚT GÁN SHIPPER */}
                <div className='flex justify-start mb-4'>
                    <Button
                        variant="contained" color="primary" startIcon={<IconUserCheck className="h-5 w-5" />}
                        onClick={handleOpenShipperDialog} disabled={selectedOrderIds.length === 0}
                        className="!px-6 !py-3 !text-base !font-semibold"
                        sx={{ textTransform: 'none', backgroundColor: '#4f46e5', '&:hover': { backgroundColor: '#4338ca' } }}
                    >
                        Gán Shipper cho ({selectedOrderIds.length}) Đơn
                    </Button>
                </div>

                {/* Phần 2: Bảng đơn hàng */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><IconClipboardList className="mr-2 text-indigo-500 h-5 w-5" /> Danh sách Đơn hàng</h2>
                    
                    {loading && (<div className="text-center p-8 bg-white rounded-xl shadow-lg"><p className="text-lg text-indigo-500">Đang tải đơn hàng...</p></div>)}
                    {apiError && (<div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg mb-6">Lỗi tải dữ liệu: {apiError}. Vui lòng kiểm tra Back-end (cổng 8082).</div>)}

                    {!loading && orders.length === 0 && !apiError && (
                        <div className="text-center p-8 bg-white rounded-xl shadow-lg"><p className="text-lg text-gray-500">Không tìm thấy đơn hàng nào thuộc đơn vị vận chuyển này.</p></div>
                    )}

                    {!loading && orders.length > 0 && (
                        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {/* Ô TÍCH CHỌN TẤT CẢ */}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                                {assignableOrdersOnPage.length > 0 && (
                                                    <Checkbox checked={isAllAssignableSelected} indeterminate={selectedOrderIds.length > 0 && !isAllAssignableSelected} onChange={handleToggleSelectAll} sx={{padding: 0}} />
                                                )}
                                            </th>
                                            {['Mã ĐH', 'Người nhận', 'Địa chỉ', 'Trạng thái', 'Shipper', 'Tổng tiền', 'Hành động'].map((header, index) => (<th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => {
                                            const fullAddress = `${order.ward}, ${order.district}, ${order.city}`;
                                            const isItemSelected = selectedOrderIds.includes(order.orderId);
                                            const isSelectable = order.shippingStatus === SHIPPING_STATUS_ASSIGNMENT; 
                                            const shipperName = shipperMap[order.shipperId] || (order.shipperId ? order.shipperId : "-");

                                            return (
                                                <tr key={order.orderId} className={`transition duration-150 ${isItemSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'} ${!isSelectable && 'opacity-80'}`}>
                                                    {/* CỘT CHECKBOX */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {isSelectable ? (<Checkbox checked={isItemSelected} onChange={() => handleToggleOrderSelect(order.orderId)} onClick={(e) => e.stopPropagation()} sx={{padding: 0}} />) : (<div className="w-4 h-4" />)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{order.orderId.substring(0, 8)}...</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.recipientName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={fullAddress}>{fullAddress}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap"><StatusChip status={order.shippingStatus} /></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{shipperName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{order.totalPrice.toLocaleString('vi-VN')} VND</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => handleViewDetails(order.orderId)} className="text-indigo-600 hover:text-indigo-900 font-semibold">Chi tiết</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Phân trang */}
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <p className="text-sm text-gray-700">Hiển thị <span className="font-medium">{(pagination.pageNumber * pagination.pageSize) + 1}</span> đến <span className="font-medium">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span> trên <span className="font-medium">{pagination.totalElements}</span> kết quả</p>
                                <div className="flex space-x-2">
                                    <button onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 0} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Trước</button>
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600">{pagination.pageNumber + 1}</span>
                                    <button onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.pageNumber >= pagination.totalPages - 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Sau</button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

            </main>
            
            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 text-xs">&copy; 2024 Hệ thống Quản lý Vận chuyển. Phát triển bởi Đơn vị Vận chuyển.</div>
            </footer>

            {/* DIALOG CHỌN SHIPPER */}
            <Dialog open={isShipperDialogOpen} onClose={handleCloseShipperDialog} fullWidth maxWidth="sm">
                <DialogTitle>Gán Shipper cho {selectedOrderIds.length} Đơn hàng</DialogTitle>
                <DialogContent dividers>
                    {shippers.length > 0 ? (
                        <List>
                            {shippers.map((unit) => (
                                <ListItem key={unit.id} disablePadding>
                                    <FormControlLabel
                                        value={unit.id} control={<Radio />} checked={selectedShipperId === unit.id} 
                                        onChange={() => setSelectedShipperId(unit.id)} 
                                        label={<ListItemText primary={unit.name} secondary={`SĐT: ${unit.phoneNumber}`} />}
                                        sx={{ width: '100%', m: 0, p: 1 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <p className='text-gray-500'>Không có shipper nào được tìm thấy. Vui lòng thêm shipper thuộc Đơn vị vận chuyển của bạn.</p>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseShipperDialog} color="error">Hủy</Button>
                    <Button
                        onClick={handleSaveShipperAssignment} color="primary" variant="contained" disabled={!selectedShipperId} 
                    >
                        Lưu và Gán ({selectedOrderIds.length} đơn)
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DeliveryUnitDashboard;