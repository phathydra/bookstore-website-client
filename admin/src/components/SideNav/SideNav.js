import React from 'react';
import { FaBook, FaFileInvoice, FaUsers, FaUserCog, FaFileImport } from 'react-icons/fa';

const SideNav = () => {
  return (
      <aside className="fixed top-0 left-0 w-[16.5%] bg-gray-800 text-white h-screen px-4 py-5 flex flex-col justify-between z-50 shadow-xl">
      <div>
        <h1 className="text-2xl font-bold mb-8">ADMINDEK</h1>
        <nav className="space-y-5">
          <a href="/book-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaBook /> <span>Quản lý Sách</span>
          </a>
          <a href="/invoice-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaFileInvoice /> <span>Quản lý Hóa Đơn</span>
          </a>
          <a href="/account-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaUserCog /> <span>Quản lý Tài Khoản</span>
          </a>
          <a href="/information-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaUsers /> <span>Quản lý Khách Hàng</span>
          </a>
          <a href="/import-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaFileImport /> <span>Quản lý Nhập Hàng</span>
          </a>
          <a href="/supplier-management" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
            <FaFileImport /> <span>Quản lý Nhà cung cấp</span>
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default SideNav;
