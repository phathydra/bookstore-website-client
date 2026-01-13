import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress, Box } from '@mui/material';
import DeliveryUnitHeader from '../DeliveryUnitHeader';
import OrderTable from './component/OrderTable';
import ShipperAssignmentDialog from './component/ShipperAssignmentDialog';
import TransferDialog from './component/TransferDialog';
import OrderDetailDialog from './component/OrderDetailDialog'; 
import ClusterDetailDialog from './component/ClusterDetailDialog'; 
// import NearbyShipperDialog from './component/NearbyShipperDialog'; // Xóa dialog này
import { useDeliveryDashboard } from './hook/useDeliveryDashboard';
import {
    IconChartLine,
    IconClipboardList,
    IconUserCheck,
    IconTransfer,
    IconBoxMultiple,
    // IconUserSearch, // Xóa icon này
} from './component/Icons';

const DeliveryUnitDashboard = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("accountId") || "N/A";

    const { state, dialogs, menu, handlers, derivedState } = useDeliveryDashboard(userId, navigate);

    const {
        orders, stats, loading, apiError, pagination,
        routeToDraw, isRouteLoading, selectedOrderIds, shipperMap,
        clusters, 
        unclusteredOrders, 
        isClustering, 
        isFindingNearbyForDialog, // Lấy state loading
    } = state;

    const { isAllAssignableSelected } = derivedState;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <DeliveryUnitHeader
                userId={userId}
                anchorEl={menu.anchorEl}
                handleMenuOpen={handlers.handleMenuOpen}
                handleMenuClose={handlers.handleMenuClose}
                handleGoToInfo={handlers.handleGoToInfo}
                handleGoToChatPage={handlers.handleGoToChatPage}
                handleLogout={handlers.handleLogout}
                routeToDraw={routeToDraw}
                isRouteLoading={isRouteLoading}
                onCloseMap={handlers.handleClearRoute}
            />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Stats Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <IconChartLine className="mr-2 text-indigo-500 h-5 w-5" /> Thống kê hoạt động
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className={`p-6 ${stat.bg} rounded-xl shadow-lg border-l-4 border-${stat.color.split('-')[1]}-400 transform transition duration-300 hover:scale-[1.02]`}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-500 truncate">{stat.title}</p>
                                    <stat.icon className={`text-2xl ${stat.color} h-6 w-6`} />
                                </div>
                                <div className="mt-1">
                                    <p className="text-3xl font-extrabold text-gray-900">
                                        {stat.value.toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- KHU VỰC GOM NHÓM --- */}
                <section className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                <IconBoxMultiple className="mr-2 text-teal-500 h-5 w-5" /> Phân cụm đơn hàng
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Tìm và nhóm các đơn hàng ở gần nhau (trong bán kính ~5km) để tối ưu giao hàng.
                            </p>
                        </div>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handlers.handleFindClusters}
                            disabled={isClustering}
                            startIcon={isClustering ? <CircularProgress size={20} color="inherit" /> : <IconBoxMultiple className="h-5 w-5" />}
                            className="!px-6 !py-3 !text-base !font-semibold"
                            sx={{ textTransform: 'none', backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
                        >
                            {isClustering ? 'Đang tìm cụm...' : 'Tìm cụm đơn hàng'}
                        </Button>
                    </div>

                    {/* Hiển thị kết quả sau khi tìm cụm */}
                    {clusters.length > 0 && (
                         <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Các cụm đã tìm thấy:</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {clusters.map((cluster) => (
                                    <div 
                                        key={cluster.clusterName} 
                                        className="p-5 bg-indigo-50 rounded-xl border border-indigo-200 shadow-md flex flex-col justify-between"
                                    >
                                        <div>
                                            <h3 className="font-bold text-base text-indigo-700 truncate" title={cluster.clusterName}>
                                                {cluster.clusterName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Có <span className="font-semibold text-lg text-gray-900">{cluster.orderIds.length}</span> đơn hàng
                                            </p>
                                        </div>
                                        <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                color="primary"
                                                className="!w-full !font-semibold"
                                                onClick={() => handlers.handleOpenClusterDetailDialog(cluster)} 
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Xem chi tiết
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="medium"
                                                color="primary"
                                                className="!w-full !font-semibold"
                                                startIcon={<IconUserCheck className="h-5 w-5" />}
                                                onClick={() => handlers.handleOpenShipperDialog(cluster.orderIds)} 
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Gán cho cụm này
                                            </Button>
                                        </Box>
                                    </div>
                                ))}
                            </div>
                         </div>
                    )}
                    
                    {/* (Tùy chọn) Hiển thị các đơn lẻ không thuộc cụm nào */}
                    {unclusteredOrders.length > 0 && (
                        <div className="mt-6">
                             <h3 className="text-lg font-semibold text-gray-800 mb-4">Các đơn hàng lẻ ({unclusteredOrders.length} đơn):</h3>
                             <p className="text-sm text-gray-500">
                                 {unclusteredOrders.map(o => o.orderId.substring(0, 8)).join(', ')}...
                             </p>
                        </div>
                    )}
                </section>

                {/* XÓA KHU VỰC TÌM SHIPPER (đã tích hợp vào dialog) */}

                {/* --- Nút gán & chuyển giao --- */}
                <div className="flex flex-wrap justify-start gap-4 mb-4">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<IconUserCheck className="h-5 w-5" />}
                        onClick={() => handlers.handleOpenShipperDialog()} 
                        disabled={selectedOrderIds.length === 0}
                        className="!px-6 !py-3 !text-base !font-semibold"
                        sx={{ textTransform: 'none', backgroundColor: '#4f46e5', '&:hover': { backgroundColor: '#4338ca' } }}
                    >
                        Gán Shipper ({selectedOrderIds.length}) Đơn
                    </Button>

                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<IconTransfer className="h-5 w-5" />}
                        onClick={handlers.handleOpenTransferDialog}
                        disabled={selectedOrderIds.length === 0}
                        className="!px-6 !py-3 !text-base !font-semibold"
                        sx={{ textTransform: 'none', backgroundColor: '#f97316', '&:hover': { backgroundColor: '#ea580c' } }}
                    >
                        Chuyển giao ĐVVC ({selectedOrderIds.length}) Đơn
                    </Button>
                </div>

                {/* Orders Table */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <IconClipboardList className="mr-2 text-indigo-500 h-5 w-5" /> Danh sách Đơn hàng
                    </h2>

                    {loading && (
                        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                            <p className="text-lg text-indigo-500">Đang tải đơn hàng...</p>
                        </div>
                    )}

                    {apiError && !loading && (
                        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg mb-6">
                            Lỗi: {apiError}
                        </div>
                    )}

                    {!loading && orders.length === 0 && !apiError && (
                        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                            <p className="text-lg text-gray-500">Không tìm thấy đơn hàng nào.</p>
                        </div>
                    )}

                    {!loading && orders.length > 0 && (
                        <>
                            <OrderTable
                                orders={orders}
                                shipperMap={shipperMap}
                                selectedOrderIds={selectedOrderIds}
                                isAllAssignableSelected={isAllAssignableSelected}
                                isRouteLoading={isRouteLoading}
                                onToggleOrderSelect={handlers.handleToggleOrderSelect}
                                onToggleSelectAll={handlers.handleToggleSelectAll}
                                onViewRoute={handlers.handleViewRoute}
                                onViewDetails={handlers.handleViewDetails}
                            />

                            {/* Pagination */}
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-b-xl">
                                <p className="text-sm text-gray-700">
                                    Hiển thị{' '}
                                    <span className="font-medium">{pagination.pageNumber * pagination.pageSize + 1}</span>{' '}
                                    đến{' '}
                                    <span className="font-medium">
                                        {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}
                                    </span>{' '}
                                    trên <span className="font-medium">{pagination.totalElements}</span> kết quả
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlers.handlePageChange(pagination.pageNumber - 1)}
                                        disabled={pagination.pageNumber === 0}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trước
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600">
                                        {pagination.pageNumber + 1}
                                    </span>
                                    <button
                                        onClick={() => handlers.handlePageChange(pagination.pageNumber + 1)}
                                        disabled={pagination.pageNumber >= pagination.totalPages - 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 text-xs">
                    &copy; 2024 Hệ thống Quản lý Vận chuyển.
                </div>
            </footer>

            {/* Dialogs */}
            
            <OrderDetailDialog
                open={dialogs.isDetailDialogOpen}
                onClose={handlers.handleCloseDetailDialog}
                order={dialogs.selectedOrderDetail}
                loading={dialogs.detailLoading}
                error={dialogs.detailError}
            />

            <ClusterDetailDialog
                open={dialogs.isClusterDetailOpen}
                onClose={handlers.handleCloseClusterDetailDialog}
                clusterName={dialogs.selectedClusterName}
                clusterOrders={dialogs.selectedClusterOrders}
            />
            
            {/* Xóa NearbyShipperDialog */}

            {/* Cập nhật props cho ShipperAssignmentDialog */}
            <ShipperAssignmentDialog
                open={dialogs.isShipperDialogOpen}
                onClose={handlers.handleCloseShipperDialog}
                onSubmit={handlers.handleSaveShipperAssignment}
                selectedOrderCount={selectedOrderIds.length}
                // Props mới
                allShippers={dialogs.allShippers}
                nearbyShippers={dialogs.nearbyShippersForDialog}
                isLoadingNearby={isFindingNearbyForDialog}
                onFindNearby={handlers.handleFindNearbyForDialog}
                onResetList={handlers.handleResetShipperListInDialog}
            />

            <TransferDialog
                open={dialogs.isTransferDialogOpen}
                onClose={handlers.handleCloseTransferDialog}
                onSubmit={handlers.handleSaveTransfer}
                otherUnits={dialogs.otherDeliveryUnits}
                selectedOrderCount={selectedOrderIds.length}
            />
        </div>
    );
};

export default DeliveryUnitDashboard;