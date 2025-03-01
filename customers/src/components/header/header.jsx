import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState({ name: "", avatar: "" });
  const menuRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const accountId = localStorage.getItem("accountId");

    if (accountId) {
      fetch(`http://localhost:8080/api/account/fetch?accountId=${accountId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser({
            name: data.name || "Guest",
            avatar: data.avatar || "https://via.placeholder.com/40",
          });
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("accountId"); // Remove account information
    navigate("/login"); // Redirect to login page
    window.location.reload(); // Reload the page
  };

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to profile page
  };

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
        <img
          className="avatar"
          src={user.avatar}
          alt="Profile"
          onClick={toggleMenu}
        />
        <span className="username">{user.name}</span>
        {isMenuOpen && (
          <div className="avatar-menu">
            <button className="menu-button" onClick={handleProfileClick}>
              Trang cá nhân
            </button>
            <button className="menu-button">Giỏ hàng</button>
            <button className="menu-button">Lịch sử mua hàng</button>
            <button className="menu-button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
