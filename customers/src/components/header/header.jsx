import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import "./header.css";
import logo from "../../assets/logo.png"; // Import ảnh logo

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState({ name: "", avatar: "" });
  const [input, setInput] = useState("")
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleChange = (e) => {
    setInput(e.target.value)
  }

  const handleSearch = async() => {
    navigate(`/products?searchParam=${input}`)
  }

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

  const handleLogoClick = () => {
    navigate("/"); // Navigate to home page
  };

  return (
    <header className="header">
      {/* Thay LOGO bằng ảnh và thêm sự kiện click */}
      <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
        <img src={logo} alt="Logo" className="logo-image" />
      </div>


      <nav className="nav-buttons">
        <button className="nav-button" onClick={() => navigate("/")}>Home</button>
        <button className="nav-button" onClick={() => navigate(`/products?searchParam=`)}>Products</button>
        <button className="nav-button">About</button>
      </nav>

      <div className="search-bar">
        <input type="text" placeholder="Search..." onChange={handleChange}/>
        <button onClick={handleSearch}>Search</button>
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
            <button className="menu-button" onClick={() => navigate('/cart')}>Giỏ hàng</button>
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
