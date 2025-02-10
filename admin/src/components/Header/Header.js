// src/components/Header/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ title }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate(); // Thêm hook useNavigate

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hàm xử lý logout
  const handleLogout = () => {
    // Xóa token (nếu bạn dùng token để xác thực)
    localStorage.removeItem('token'); 
    navigate('/login'); // Điều hướng về trang đăng nhập
  };

  return (
    <header className="fixed top-0 left-1/5 w-[80%] flex justify-between items-center bg-white shadow-md py-4 px-10 z-40">
      <h2 className="text-2xl font-bold text-center">{title}</h2>
      <div className="flex items-center space-x-3 relative" ref={menuRef}>
        <img
          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-lg"
          src="https://via.placeholder.com/40"
          alt="Profile"
        />
        <span className="text-sm font-semibold text-gray-700">John Doe</span>

        {/* Nút Menu (3 gạch) */}
        <button onClick={toggleMenu} className="flex flex-col items-center space-y-1 ml-4">
          <span className="w-5 h-1 bg-gray-700"></span>
          <span className="w-5 h-1 bg-gray-700"></span>
          <span className="w-5 h-1 bg-gray-700"></span>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-48 py-2">
            <ul className="space-y-2">
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <Link to="/profile">Profile</Link>
              </li>
              {/* Gọi hàm handleLogout khi nhấn Log Out */}
              <li
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Log Out
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
