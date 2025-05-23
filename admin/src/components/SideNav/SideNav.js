import React, { useState } from 'react';
import { FaBook, FaFileInvoice, FaUsers, FaUserCog, FaPercent, FaTicketAlt, FaTruck, FaPlus, FaMinus } from 'react-icons/fa';

const SideNav = ({ onToggleCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse(!isCollapsed); // Gửi trạng thái lên component cha
  };

  return (
    <aside className={`fixed top-0 left-0 ${isCollapsed ? 'w-[5%]' : 'w-[16.5%]'} bg-gray-800 text-white h-screen px-4 py-5 flex flex-col justify-between z-50 shadow-xl transition-all duration-300`}>
      <div>
        <div className="flex justify-between items-center mb-8">
          {!isCollapsed && <h1 className="text-2xl font-bold">ADMINDEK</h1>}
          <button className="p-2 bg-gray-700 rounded" onClick={toggleCollapse}>
            {isCollapsed ? <FaPlus /> : <FaMinus />}
          </button>
        </div>
        <nav className="space-y-5">
          <a href="/book-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaBook /> {!isCollapsed && <span>Quản lý Sách</span>}
          </a>
          <a href="/invoice-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaFileInvoice /> {!isCollapsed && <span>Quản lý Hóa Đơn</span>}
          </a>
          <a href="/account-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaUserCog /> {!isCollapsed && <span>Quản lý Tài Khoản</span>}
          </a>
          <a href="/information-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaUsers /> {!isCollapsed && <span>Quản lý Khách Hàng</span>}
          </a>
          <a href="/discount-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaPercent /> {!isCollapsed && <span>Quản lý Giảm Giá</span>}
          </a>
          <a href="/voucher-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaTicketAlt /> {!isCollapsed && <span>Quản lý Voucher</span>}
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default SideNav;