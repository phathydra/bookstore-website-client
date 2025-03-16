import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ title }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState({ name: "", avatar: "" });
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
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("accountId");
    navigate("/login");
  };

  return (
      <header className="fixed top-0 left-[16.5%] w-[83.5%] flex justify-between items-center bg-white shadow-md py-4 px-10 z-40">
      <h2 className="text-2xl font-bold text-center">{title}</h2>
      <div className="flex items-center space-x-3 relative" ref={menuRef}>
      <img
          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-lg ml-2"
          src={user.avatar}
          alt="Profile"
        />
        <span className="text-sm font-semibold text-gray-700 pl-2">
          {user.name}
        </span>
        <button onClick={toggleMenu} className="flex flex-col items-center space-y-1 ml-4">
          <span className="w-5 h-1 bg-gray-700"></span>
          <span className="w-5 h-1 bg-gray-700"></span>
          <span className="w-5 h-1 bg-gray-700"></span>
        </button>

        {isMenuOpen && (
          <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-48 py-2">
            <ul className="space-y-2">
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <Link to="/profile">Profile</Link>
              </li>
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <Link to="/change-password">Đổi mật khẩu</Link>
              </li>
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
