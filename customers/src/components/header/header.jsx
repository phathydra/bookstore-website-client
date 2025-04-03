import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
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
          setIsLogin(true);
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, []);

  const handleChange = (e) => setInput(e.target.value);

  

  // Header.js
  const handleSearch = () => {
    if (input.trim() !== "") {
        navigate(`/products?searchParam=${encodeURIComponent(input)}`);
    } else {
        navigate(`/products`); // Điều hướng đến trang product mà không có search param nếu input rỗng
    }
  };
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
    setIsLogin(false);
    navigate("/login");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-5 bg-cyan-100 shadow-md">
      {/* Logo và menu bên trái */}
      <div className="flex items-center space-x-6">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" className="w-24" />
        </div>
        <nav className="flex" style={{ gap: "20px" }}>
          <button className="text-gray-700 hover:text-blue-500 focus:outline-none" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="text-gray-700 hover:text-blue-500 focus:outline-none" onClick={() => navigate("/products?searchParam=")}>
            Products
          </button>
          <button className="text-gray-700 hover:text-blue-500 focus:outline-none" onClick={() => navigate("/category/someCategory")}>
            Category
          </button>
        </nav>
      </div>

      {/* Search Bar + Giỏ hàng + Avatar Menu */}
      <div className="flex items-center gap-x-6 pr-10">
        {/* Search Bar */}
        <div className="relative flex items-center w-full max-w-lg">
          <input
            type="text"
            placeholder="Search..."
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="px-6 py-3 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-300 border-none bg-gray-100 w-500 h-12"
          />
          <button
            onClick={handleSearch}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 focus:outline-none"
          >
            <FaSearch />
          </button>
        </div>

        {/* Icon Giỏ Hàng */}
        <button
          className="relative text-gray-700 hover:text-blue-500 focus:outline-none"
          onClick={() => navigate("/cart")}
        >
          <FaShoppingCart className="text-2xl" />
        </button>

        {/* User Avatar */}
        <div className="relative flex items-center gap-x-4" ref={menuRef}>
          {isLogin && <span className="text-gray-700 font-medium">{user.name}</span>}
          <img
            className="w-10 h-10 rounded-full cursor-pointer"
            src={isLogin ? user.avatar : GUEST}
            alt="Profile"
            onClick={toggleMenu}
          />
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-50">
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                onClick={() => navigate(isLogin ? "/profile" : "/login")}
              >
                Trang cá nhân
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                onClick={() => navigate(isLogin ? "/orderHistory" : "/login")}
              >
                Lịch sử mua hàng
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                onClick={() => navigate(isLogin ? "/address" : "/login")}
              >
                Địa chỉ nhận hàng
              </button>
              <button
                className="block w-full px-4 py-2 text-left bg-red-500 text-white hover:bg-red-600 focus:outline-none"
                onClick={handleLogout}
              >
                {isLogin ? "Đăng xuất" : "Đăng nhập"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
