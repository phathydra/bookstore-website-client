import React from 'react';
import { FaUser, FaMapMarkerAlt, FaLock, FaBox, FaWallet } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; // Import Link và useNavigate

const SideNavProfile = ({ selected }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Thông tin tài khoản', key: 'info', icon: <FaUser />, path: '/profile' },
    { label: 'Địa chỉ nhận hàng', key: 'address', icon: <FaMapMarkerAlt />, path: '/profile' }, // Hoặc trang riêng
    { label: 'Đổi mật khẩu', key: 'password', icon: <FaLock />, path: '/changePassword' },
    { label: 'Đơn hàng của tôi', key: 'orders', icon: <FaBox />, path: '/profile' }, // Hoặc trang riêng
    { label: 'Ví Voucher', key: 'voucher', icon: <FaWallet />, path: '/profile' }, // Hoặc trang riêng
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="w-full md:w-1/4 bg-white shadow rounded-xl p-4 h-screen"> {/* Thêm class h-screen */}
      <h2 className="text-lg font-semibold mb-4">Tài khoản của bạn</h2>
      <ul className="space-y-3">
        {navItems.map((item) => (
          <li
            key={item.key}
            onClick={() => handleItemClick(item.path)}
            className={`cursor-pointer p-2 rounded-lg transition flex items-center space-x-3 ${
              selected === item.key
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideNavProfile;