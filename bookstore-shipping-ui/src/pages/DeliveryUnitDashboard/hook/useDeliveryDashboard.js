import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { 
    SHIPPING_STATUS_ASSIGNMENT, 
    SHIPPING_STATUS_SHIPPING, 
    SHIPPING_STATUS_DELIVERED 
} from '../constants';
import { 
    IconClipboardList, 
    IconTruck, 
    IconCheckCircle 
} from '../component/Icons';

export const useDeliveryDashboard = (userId, navigate) => {
    // States chung
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState([
        { key: 'total', icon: IconClipboardList, title: "Tổng đơn hàng", value: 0, color: "text-indigo-600", bg: "bg-indigo-50" },
        { key: 'shipping', icon: IconTruck, title: "Đơn đang xử lý / Đang giao", value: 0, color: "text-blue-600", bg: "bg-blue-50" },
        { key: 'delivered', icon: IconCheckCircle, title: "Đã giao thành công", value: 0, color: "text-green-600", bg: "bg-green-50" },
    ]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [pagination, setPagination] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 1 });

    // State gán shipper
    const [allShippers, setAllShippers] = useState([]); // Danh sách TẤT CẢ shipper
    const [isShipperDialogOpen, setIsShipperDialogOpen] = useState(false);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [shipperMap, setShipperMap] = useState({});

    // States chuyển giao ĐVVC
    const [otherDeliveryUnits, setOtherDeliveryUnits] = useState([]);
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [otherDeliveryUnitMap, setOtherDeliveryUnitMap] = useState({});

    // States bản đồ
    const [routeToDraw, setRouteToDraw] = useState(null);
    const [isRouteLoading, setIsRouteLoading] = useState(false);

    // States Menu
    const [anchorEl, setAnchorEl] = useState(null);

    // STATE CHO DIALOG CHI TIẾT ĐƠN HÀNG
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);

    // STATE CHO PHÂN CỤM
    const [clusters, setClusters] = useState([]);
    const [unclusteredOrders, setUnclusteredOrders] = useState([]);
    const [isClustering, setIsClustering] = useState(false);

    // STATE CHO CHI TIẾT CỤM
    const [isClusterDetailOpen, setIsClusterDetailOpen] = useState(false);
    const [selectedClusterOrders, setSelectedClusterOrders] = useState([]);
    const [selectedClusterName, setSelectedClusterName] = useState('');

    // STATE TÌM SHIPPER GẦN (BÊN TRONG DIALOG)
    const [isFindingNearbyForDialog, setIsFindingNearbyForDialog] = useState(false);
    const [nearbyShippersForDialog, setNearbyShippersForDialog] = useState(null); // null = chưa tìm, [] = tìm ko thấy

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
        if (userId === "N/A") {
            setApiError("Không tìm thấy ID đơn vị vận chuyển.");
            setLoading(false);
            return;
        }
        try {
            const response = await api.getOrders(userId, page, size);
            const { content: newOrders = [], pageable = {}, totalElements = 0, totalPages = 1 } = response.data || {};
            const { pageNumber = 0, pageSize = 10 } = pageable;

            setOrders(newOrders);
            setPagination({ pageNumber, pageSize, totalElements, totalPages });
            updateStats(newOrders, totalElements);

            // Lọc lại các order đã chọn
            setSelectedOrderIds(prevIds =>
                prevIds.filter(id => {
                    const order = newOrders.find(o => o.orderId === id);
                    return order && order.shippingStatus === SHIPPING_STATUS_ASSIGNMENT;
                })
            );
        } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error);
            const errorMsg = error.response?.data?.message || error.message || "Không thể kết nối hoặc tải dữ liệu đơn hàng.";
            setApiError(`Lỗi tải đơn hàng: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    }, [updateStats, userId]);

    // --- HÀM TẢI TẤT CẢ SHIPPER ---
    const fetchAllShippers = async () => {
        try {
            const response = await api.getShippers(userId);
            const units = response.data || [];
            const unitMap = units.reduce((map, unit) => ({ ...map, [unit.accountId]: unit.email }), {});
            setShipperMap(unitMap);
            setAllShippers(units.map(unit => ({ id: unit.accountId, name: unit.email, phoneNumber: unit.phone || 'N/A' })) || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Shipper:", error);
            setAllShippers([]);
            setShipperMap({});
        }
    };

    // --- HÀM TẢI CÁC ĐVVC KHÁC ---
    const fetchOtherDeliveryUnits = async () => {
        try {
            const response = await api.getOtherDeliveryUnits(userId);
            const allUnits = response.data || [];
            const otherUnits = allUnits.filter(unit => unit.accountId !== userId);
            const unitMap = otherUnits.reduce((map, unit) => ({ ...map, [unit.accountId]: unit.email }), {});
            setOtherDeliveryUnitMap(unitMap);
            setOtherDeliveryUnits(otherUnits.map(unit => ({ id: unit.accountId, name: unit.email, phoneNumber: unit.phone || 'N/A' })) || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách ĐVVC khác:", error);
            setOtherDeliveryUnits([]);
            setOtherDeliveryUnitMap({});
        }
    };

    // --- HÀM LẤY VÀ HIỂN THỊ TUYẾN ĐƯỜNG ---
    const handleViewRoute = async (orderId) => {
        if (!orderId) return;
        setIsRouteLoading(true);
        setApiError(null);
        setRouteToDraw(null);
        try {
            const response = await api.getRouteForOrder(userId, orderId);
            if (response.data && response.data.routes && response.data.routes.length > 0) {
                setRouteToDraw(response.data);
            } else {
                const errorMsg = response.data?.errorMessage || "Không tìm thấy tuyến đường hợp lệ.";
                alert(errorMsg);
            }
        } catch (error) {
            console.error("Lỗi khi tải tuyến đường:", error);
            const errorMsg = error.response?.data?.errorMessage || error.response?.data?.body || error.message || "Lỗi kết nối máy chủ bản đồ (8084).";
            setApiError(`Lỗi tải tuyến đường: ${errorMsg}`);
            alert(`Lỗi khi tải tuyến đường: ${errorMsg}`);
        } finally {
            setIsRouteLoading(false);
        }
    };

    // --- CÁC HANDLERS KHÁC ---
    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleGoToInfo = () => {
        handleMenuClose();
        navigate('/DeliveryUnitInfo');
    };
    const handleGoToChatPage = () => {
        handleMenuClose();
        navigate('/chat');
    };
    const handleLogout = () => {
        handleMenuClose();
        localStorage.removeItem("accountId");
        localStorage.removeItem("role");
        navigate('/');
    };

    const handleClearRoute = () => setRouteToDraw(null);

    const handleToggleOrderSelect = (orderId) => {
        const orderToToggle = orders.find(o => o.orderId === orderId);
        if (!orderToToggle || orderToToggle.shippingStatus !== SHIPPING_STATUS_ASSIGNMENT) {
            alert(`Đơn hàng ${orderId.substring(0, 8)}... không thể chọn vì đang ở trạng thái "${orderToToggle?.shippingStatus}". Chỉ có thể gán/chuyển giao đơn ở trạng thái "${SHIPPING_STATUS_ASSIGNMENT}".`);
            return;
        }
        setSelectedOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const handleToggleSelectAll = () => {
        const assignableOrdersOnPage = orders.filter(order => order.shippingStatus === SHIPPING_STATUS_ASSIGNMENT);
        const allSelected = assignableOrdersOnPage.length > 0 && selectedOrderIds.length === assignableOrdersOnPage.length;
        setSelectedOrderIds(allSelected ? [] : assignableOrdersOnPage.map(o => o.orderId));
    };

    // --- HANDLER MỞ DIALOG GÁN SHIPPER ---
    const handleOpenShipperDialog = (orderIdsToAssign = null) => {
        const targetOrderIds = orderIdsToAssign || selectedOrderIds;

        const assignableSelected = targetOrderIds.filter(id => 
            orders.find(o => o.orderId === id)?.shippingStatus === SHIPPING_STATUS_ASSIGNMENT
        );

        if (assignableSelected.length === 0) {
            alert(`Vui lòng chọn (hoặc nhóm phải có) ít nhất một đơn hàng ở trạng thái "${SHIPPING_STATUS_ASSIGNMENT}" để gán shipper.`);
            return;
        }
        
        setSelectedOrderIds(assignableSelected); 
        fetchAllShippers(); // Tải danh sách TẤT CẢ shipper
        setNearbyShippersForDialog(null); // Reset danh sách tìm gần
        setIsFindingNearbyForDialog(false); // Reset loading
        setIsShipperDialogOpen(true); 
    };

    const handleCloseShipperDialog = () => setIsShipperDialogOpen(false);

    const handleSaveShipperAssignment = async (selectedShipperId) => {
        if (!selectedShipperId || selectedOrderIds.length === 0) {
            alert("Vui lòng chọn đơn hàng và một shipper.");
            return;
        }
        try {
            await api.assignShipperAndUpdateStatus(selectedOrderIds, selectedShipperId);
            
            const assignedShipperName = shipperMap[selectedShipperId] || selectedShipperId;
            alert(`Đã gán thành công shipper ${assignedShipperName} và chuyển trạng thái thành "${SHIPPING_STATUS_SHIPPING}" cho ${selectedOrderIds.length} đơn hàng.`);

            setSelectedOrderIds([]);
            handleCloseShipperDialog();
            fetchOrders(pagination.pageNumber, pagination.pageSize);
        } catch (error) {
            console.error("Lỗi khi gán shipper hoặc cập nhật trạng thái:", error);
            alert("Lỗi khi gán shipper hoặc cập nhật trạng thái: " + (error.response?.data?.message || error.message));
        }
    };

    // --- HANDLERS CHUYỂN GIAO ĐVVC ---
    const handleOpenTransferDialog = () => {
        const assignableSelected = selectedOrderIds.filter(id => orders.find(o => o.orderId === id)?.shippingStatus === SHIPPING_STATUS_ASSIGNMENT);
        if (assignableSelected.length === 0) {
            alert(`Vui lòng chọn ít nhất một đơn hàng ở trạng thái "${SHIPPING_STATUS_ASSIGNMENT}" để chuyển giao.`);
            return;
        }
        setSelectedOrderIds(assignableSelected);
        fetchOtherDeliveryUnits();
        setIsTransferDialogOpen(true);
    };

    const handleCloseTransferDialog = () => setIsTransferDialogOpen(false);

    const handleSaveTransfer = async (selectedNewDeliveryUnitId) => {
        if (!selectedNewDeliveryUnitId || selectedOrderIds.length === 0) {
            alert("Vui lòng chọn đơn hàng và một đơn vị vận chuyển mới.");
            return;
        }
        try {
            await api.transferOrdersToUnit(selectedOrderIds, selectedNewDeliveryUnitId);
            
            const newUnitName = otherDeliveryUnitMap[selectedNewDeliveryUnitId] || selectedNewDeliveryUnitId;
            alert(`Đã chuyển giao thành công ${selectedOrderIds.length} đơn hàng cho ĐVVC: ${newUnitName}.`);

            setSelectedOrderIds([]);
            handleCloseTransferDialog();
            fetchOrders(pagination.pageNumber, pagination.pageSize);
        } catch (error) {
            console.error("Lỗi khi chuyển giao đơn hàng:", error);
            alert("Lỗi khi chuyển giao đơn hàng: " + (error.response?.data?.message || error.message));
        }
    };

    // --- HANDLER CHI TIẾT ĐƠN HÀNG ---
    const handleViewDetails = async (orderId) => {
        setIsDetailDialogOpen(true);
        setDetailLoading(true);
        setDetailError(null);
        setSelectedOrderDetail(null);
        try {
            const response = await api.getOrderDetail(orderId);
            setSelectedOrderDetail(response.data);
        } catch (error) {
            console.error("Lỗi khi tải chi tiết đơn hàng:", error);
            const errorMsg = error.response?.data?.message || error.message || "Không thể tải chi tiết đơn hàng.";
            setDetailError(errorMsg);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetailDialog = () => {
        setIsDetailDialogOpen(false);
        setSelectedOrderDetail(null);
        setDetailError(null);
    };

    // --- HANDLER PHÂN TRANG ---
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchOrders(newPage, pagination.pageSize);
        }
    };

    // --- HANDLER PHÂN CỤM ---
    const handleFindClusters = async () => {
        setIsClustering(true);
        setApiError(null);
        setClusters([]);
        setUnclusteredOrders([]);

        const assignableOrders = orders.filter(
            o => o.shippingStatus === SHIPPING_STATUS_ASSIGNMENT
        );
        
        if (assignableOrders.length < 2) {
            alert("Cần ít nhất 2 đơn hàng đang chờ để có thể phân cụm.");
            setIsClustering(false);
            return;
        }

        const ordersToCluster = assignableOrders.map(o => ({
            orderId: o.orderId,
            address: `${o.note || ''}, ${o.ward}, ${o.district}, ${o.city}`
        }));

        try {
            const response = await api.postOrderClusters(ordersToCluster, {
                maxDistanceKm: 5, 
                minClusterSize: 2
            });

            const { clusters: newClusters = [], unclusteredOrderIds = [] } = response.data;
            setClusters(newClusters);
            
            const unclusteredSet = new Set(unclusteredOrderIds);
            const unclusteredFullOrders = assignableOrders.filter(o => unclusteredSet.has(o.orderId));
            setUnclusteredOrders(unclusteredFullOrders);
            
            if (newClusters.length === 0) {
                 alert("Không tìm thấy cụm đơn hàng nào. Tất cả các đơn hàng nằm quá xa nhau.");
            }

        } catch (error) {
            console.error("Lỗi khi phân cụm đơn hàng:", error);
            const errorMsg = error.response?.data?.message || error.message || "Lỗi máy chủ khi phân cụm.";
            setApiError(`Lỗi phân cụm: ${errorMsg}`);
            alert(`Lỗi khi phân cụm: ${errorMsg}`);
        } finally {
            setIsClustering(false);
        }
    };

    // --- HANDLERS CHO CHI TIẾT CỤM ---
    const handleOpenClusterDetailDialog = (cluster) => {
        const clusterOrderIds = new Set(cluster.orderIds);
        const fullOrdersInCluster = orders.filter(o => clusterOrderIds.has(o.orderId));
        
        setSelectedClusterName(cluster.clusterName);
        setSelectedClusterOrders(fullOrdersInCluster);
        setIsClusterDetailOpen(true);
    };

    const handleCloseClusterDetailDialog = () => {
        setIsClusterDetailOpen(false);
        setSelectedClusterName('');
        setSelectedClusterOrders([]);
    };
    // ------------------------------------

    // --- HANDLERS TÌM SHIPPER GẦN (ĐỂ TRUYỀN VÀO DIALOG) ---
    const handleFindNearbyForDialog = async (radiusKm = 5) => {
        setIsFindingNearbyForDialog(true);
        setNearbyShippersForDialog(null); // Clear previous results
        try {
            const response = await api.findNearbyShippers(userId, radiusKm);
            const foundShippers = response.data || [];
            
            if (foundShippers.length === 0) {
                alert(`Không tìm thấy shipper nào đang hoạt động (có GPS) trong bán kính ${radiusKm}km.`);
            }
            // Cập nhật danh sách (kể cả khi rỗng)
            setNearbyShippersForDialog(foundShippers.map(s => ({
                id: s.shipperId, // Chuyển đổi ShipInfor sang format của dialog
                name: s.name !== 'null' ? s.name : (s.email || s.shipperId),
                phoneNumber: s.phone !== 'null' ? s.phone : 'N/A'
            })));
        } catch (error) {
            console.error("Lỗi khi tìm shipper lân cận:", error);
            const errorMsg = error.response?.data?.message || error.message || "Lỗi máy chủ khi tìm shipper.";
            alert(`Lỗi khi tìm shipper: ${errorMsg}`);
            setNearbyShippersForDialog([]); // Đặt là mảng rỗng khi có lỗi
        } finally {
            setIsFindingNearbyForDialog(false);
        }
    };

    // Handler để reset về danh sách đầy đủ
    const handleResetShipperListInDialog = () => {
        setNearbyShippersForDialog(null); // Đặt về null để dùng 'allShippers'
    };
    // ------------------------------------------


    // --- EFFECT KHỞI TẠO ---
    useEffect(() => {
        if (localStorage.getItem("role") !== 'DeliveryUnit') {
            navigate('/');
        } else {
            fetchOrders(pagination.pageNumber, pagination.pageSize);
        }
    }, [navigate, fetchOrders, pagination.pageNumber, pagination.pageSize]); // fetchOrders đã được bọc trong useCallback

    // --- GIÁ TRỊ TÍNH TOÁN ---
    const assignableOrdersOnPage = orders.filter(order => order.shippingStatus === SHIPPING_STATUS_ASSIGNMENT);
    const isAllAssignableSelected = assignableOrdersOnPage.length > 0 && selectedOrderIds.length === assignableOrdersOnPage.length;

    // --- TRẢ VỀ STATE VÀ HANDLERS ---
    return {
        state: {
            orders,
            stats,
            loading,
            apiError,
            pagination,
            routeToDraw,
            isRouteLoading,
            selectedOrderIds,
            shipperMap,
            clusters,
            unclusteredOrders,
            isClustering,
            isFindingNearbyForDialog, // state loading mới
        },
        dialogs: {
            isShipperDialogOpen,
            isTransferDialogOpen,
            allShippers, // Đổi tên từ shippers
            otherDeliveryUnits,
            
            isDetailDialogOpen,
            selectedOrderDetail,
            detailLoading,
            detailError,

            isClusterDetailOpen,
            selectedClusterOrders,
            selectedClusterName,

            nearbyShippersForDialog, // state danh sách shipper gần
        },
        menu: {
            anchorEl,
        },
        handlers: {
            handleMenuOpen,
            handleMenuClose,
            handleGoToInfo,
            handleGoToChatPage,
            handleLogout,
            handleClearRoute,
            handleToggleOrderSelect,
            handleToggleSelectAll,
            handleOpenShipperDialog,
            handleCloseShipperDialog,
            handleSaveShipperAssignment,
            handleOpenTransferDialog,
            handleCloseTransferDialog,
            handleSaveTransfer,
            handleViewDetails,
            handleCloseDetailDialog,
            handlePageChange,
            handleViewRoute,
            handleFindClusters,
            handleOpenClusterDetailDialog,
            handleCloseClusterDetailDialog,

            // handlers mới
            handleFindNearbyForDialog,
            handleResetShipperListInDialog,
        },
        derivedState: {
            assignableOrdersOnPage,
            isAllAssignableSelected,
        }
    };
};