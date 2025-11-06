// src/pages/DeliveryUnitDashboard/component/OrderTable.js
import React from 'react';
import { Checkbox } from '@mui/material';
import StatusChip from './StatusChip';
import { SHIPPING_STATUS_ASSIGNMENT } from '../constants';

const OrderTable = ({
    orders,
    shipperMap,
    selectedOrderIds,
    isAllAssignableSelected,
    isRouteLoading,
    onToggleOrderSelect,
    onToggleSelectAll,
    onViewRoute,
    onViewDetails
}) => {
    
    const assignableOrdersOnPage = orders.filter(order => order.shippingStatus === SHIPPING_STATUS_ASSIGNMENT).length > 0;

    return (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                {assignableOrdersOnPage && (
                                    <Checkbox
                                        checked={isAllAssignableSelected}
                                        indeterminate={selectedOrderIds.length > 0 && !isAllAssignableSelected}
                                        onChange={onToggleSelectAll}
                                        sx={{ padding: 0 }}
                                    />
                                )}
                            </th>
                            {['Mã ĐH', 'Người nhận', 'Địa chỉ', 'Trạng thái', 'Shipper', 'Tổng tiền', 'Hành động'].map((header, index) => (
                                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => {
                            const fullAddress = `${order.note ? order.note + ', ' : ''}${order.ward}, ${order.district}, ${order.city}`;
                            const isItemSelected = selectedOrderIds.includes(order.orderId);
                            const isSelectable = order.shippingStatus === SHIPPING_STATUS_ASSIGNMENT;
                            const shipperName =
                                shipperMap[order.shipperId] ||
                                (order.shipperId ? `ID: ${order.shipperId.substring(0, 6)}...` : '-');

                            return (
                                <tr
                                    key={order.orderId}
                                    className={`transition duration-150 ${isItemSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {isSelectable ? (
                                            <Checkbox
                                                checked={isItemSelected}
                                                onChange={() => onToggleOrderSelect(order.orderId)}
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{ padding: 0 }}
                                            />
                                        ) : (
                                            <div className="w-4 h-4" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                        {order.orderId.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.recipientName}
                                    </td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate"
                                        title={fullAddress}
                                    >
                                        {fullAddress}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusChip status={order.shippingStatus} />
                                    </td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                        title={order.shipperId}
                                    >
                                        {shipperName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                        {order.totalPrice.toLocaleString('vi-VN')} VND
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => onViewRoute(order.orderId)}
                                            className={`font-semibold ${isRouteLoading ? 'text-gray-400 cursor-wait' : 'text-blue-600 hover:text-blue-900'}`}
                                            disabled={isRouteLoading}
                                            title={isRouteLoading ? 'Đang tải...' : 'Xem đường đi từ kho đến khách'}
                                        >
                                            {isRouteLoading ? 'Đang tải...' : 'Xem đường đi'}
                                        </button>
                                        <button
                                            onClick={() => onViewDetails(order.orderId)}
                                            className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderTable;