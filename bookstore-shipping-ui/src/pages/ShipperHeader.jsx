import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ShipperHeader = ({ shipperId }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem("accountId");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleManageInfo = () => {
    navigate("/shipper-info");
    setMenuOpen(false);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Trang Shipper</h1>

        <div className="flex items-center space-x-4 relative" ref={menuRef}>
          <span className="text-sm text-gray-600">
            Shipper ID:{" "}
            <span className="font-mono bg-gray-200 px-2 py-1 rounded">
              {shipperId}
            </span>
          </span>

          {/* Nút menu */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            Menu
          </button>

          {/* Menu dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg w-48 py-2 animate-fadeIn">
              <button
                onClick={handleManageInfo}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Quản lý thông tin
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ShipperHeader;
