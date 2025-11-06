// src/pages/DeliveryUnitDashboard/component/StatusChip.js
import React from 'react';
import { 
    SHIPPING_STATUS_ASSIGNMENT, 
    SHIPPING_STATUS_SHIPPING, 
    SHIPPING_STATUS_DELIVERED 
} from '../constants';

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

export default StatusChip;