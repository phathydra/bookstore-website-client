import React, { useState, useEffect, useRef } from "react";
import "./header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="logo">LOGO</div>
      <nav className="nav-buttons">
        <button className="nav-button">Home</button>
        <button className="nav-button">Products</button>
        <button className="nav-button">About</button>
      </nav>
      <div className="search-bar">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="avatar-container" ref={menuRef}>
        <div className="avatar" onClick={toggleMenu}>A</div>
        {isMenuOpen && (
          <div className="avatar-menu">
            <button className="menu-button">Trang cá nhân</button>
            <button className="menu-button">Giỏ hàng</button>
            <button className="menu-button">Lịch sử mua hàng</button>
            <button className="menu-button">Đăng xuất</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
