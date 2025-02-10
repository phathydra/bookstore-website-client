import React from 'react';
import 'tailwindcss/tailwind.css';
import { FaBook, FaFileInvoice, FaUsers, FaUserCog, FaFileImport } from 'react-icons/fa';

const SideNavigation = () => {
    return (
        <div className="flex h-screen">
            {/* Sidebar cố định */}
            <aside className="w-1/5 bg-gray-800 text-white p-5 fixed h-full">
                <h1 className="text-2xl font-bold mb-8">ADMINDEK</h1>
                <nav className="space-y-5">
                    <a href="#" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
                        <FaBook /> <span>Book Management</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
                        <FaFileInvoice /> <span>Bill Management</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
                        <FaUserCog /> <span>Account Management</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
                        <FaUsers /> <span>Customer Management</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 py-2 hover:bg-gray-700 rounded">
                        <FaFileImport /> <span>Import Management</span>
                    </a>
                </nav>
            </aside>

            {/* Main Content (phải cách sidebar 20%) */}
            <main className="flex-1 p-10 bg-gray-100 ml-[20%] h-screen overflow-auto">
                {/* Header cố định */}
                <header className="fixed top-0 right-0 w-[80%] flex justify-between items-center bg-white shadow-md py-4 px-10 z-50">
                    <h2 className="text-2xl font-bold">ADMIN PANEL</h2>

                    {/* Phần tên và ảnh profile */}
                    <div className="flex items-center space-x-3 p-2">
                        <img className="w-10 h-10 rounded-full" src="https://via.placeholder.com/40" alt="Profile" />
                        <span className="text-sm text-gray-700 font-semibold">John Doe</span>
                    </div>
                </header>

                {/* Nội dung chính bên dưới header */}
                <div className="mt-20">
                    <p>Your main content goes here...</p>
                </div>
            </main>
        </div>
    );
};

export default SideNavigation;
