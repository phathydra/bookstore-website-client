import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";
import logo from "../../assets/logo.png"; 
import GUEST from "../../assets/GUEST.jpg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState({ name: "", avatar: "" });
  const [input, setInput] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

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
        setIsLogin(true);
    }
  }, []);

  const handleChange = (e) => setInput(e.target.value);

  const handleSearch = () => navigate(`/products?searchParam=${input}`);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

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
    localStorage.removeItem("accountId");
    navigate("/login");
    window.location.reload();
  };

  const handleProfileClick = () => isLogin ? navigate("/profile") : navigate("/login");
  const handleLogoClick = () => navigate("/");
  const handleCartClick = () => isLogin ? navigate("/cart") : navigate("/login");
  const handleAddressClick = () => isLogin ? navigate("/adress") : navigate("/login");
  const handlehistoryClick = () => isLogin ? navigate("/orderHistory") : navigate("/login");

  return (
    <header className="header">
      <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
        <img src={logo} alt="Logo" className="logo-image" />
      </div>

      <nav className="nav-buttons">
        <button className="nav-button" onClick={() => navigate("/")}>Home</button>
        <button className="nav-button" onClick={() => navigate("/products?searchParam=")}>Products</button>
        <button className="nav-button">About</button>
      </nav>

      <div className="search-bar">
        <input type="text" placeholder="Search..." onChange={handleChange} />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="avatar-container" ref={menuRef}>
        <img className="avatar" src={isLogin ? user.avatar : GUEST} alt="Profile" onClick={toggleMenu} />
        <span className="username">{user.name}</span>
        {isMenuOpen && (
          <div className="avatar-menu">
            <button className="menu-button" onClick={handleProfileClick}>Trang cá nhân</button>
            <button className="menu-button" onClick={handleCartClick}>Giỏ hàng</button>
            <button className="menu-button"onClick={handlehistoryClick}>Lịch sử mua hàng</button>
            <button className="menu-button" onClick={handleAddressClick}>Địa chỉ nhận hàng</button>
            <button className="menu-button" onClick={handleLogout}>Đăng xuất</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
