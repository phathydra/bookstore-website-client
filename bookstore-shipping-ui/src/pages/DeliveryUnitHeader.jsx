import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';

// --- INLINE SVG ICONS (Đảm bảo các icon cần thiết được import hoặc định nghĩa lại) ---
const IconMapPin = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>);

/**
 * Component Header cho Giao diện Đơn vị Vận chuyển.
 * @param {object} props
 * @param {string} props.userId - ID của đơn vị vận chuyển.
 * @param {HTMLElement | null} props.anchorEl - State để neo Menu.
 * @param {function} props.handleMenuOpen - Mở Menu.
 * @param {function} props.handleMenuClose - Đóng Menu.
 * @param {function} props.handleGoToInfo - Chuyển hướng đến trang thông tin.
 * @param {function} props.handleLogout - Xử lý đăng xuất.
 */
const DeliveryUnitHeader = ({ 
    userId, 
    anchorEl, 
    handleMenuOpen, 
    handleMenuClose, 
    handleGoToInfo, 
    handleLogout 
}) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <IconMapPin className="text-3xl text-indigo-600 h-8 w-8" />
                    <h1 className="text-2xl font-bold text-gray-900">Quản Lý Vận Chuyển</h1>
                </div>

                {/* --- Menu thay cho nút Đăng xuất --- */}
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 hidden sm:inline">
                        Mã Đơn Vị: <span className="font-mono text-xs bg-gray-200 p-1 rounded-md">{userId}</span>
                    </span>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleMenuOpen}
                        sx={{ textTransform: 'none', backgroundColor: '#4f46e5', '&:hover': { backgroundColor: '#4338ca' } }}
                    >
                        Menu
                    </Button>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <MenuItem onClick={handleGoToInfo}>Quản lý thông tin</MenuItem>
                        <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                    </Menu>
                </div>
            </div>
        </header>
    );
};

export default DeliveryUnitHeader;