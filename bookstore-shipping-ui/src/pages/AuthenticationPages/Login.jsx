import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// Đã sửa lỗi: Chuyển sang sử dụng gói 'react-icons/fa' để đảm bảo tương thích
import { FaEye, FaEyeSlash, FaTruck } from "react-icons/fa"; 

// URL cơ sở cho dịch vụ Account (Giả định đang chạy trên 8080)
const ACCOUNT_API_URL = "http://localhost:8080/api/account/login";
const TARGET_ROLE = "DeliveryUnit";
const SUCCESS_REDIRECT = "/delivery-orders"; // Chuyển hướng tới trang quản lý đơn hàng

const DeliveryUnitLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập khi component được tải
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole === TARGET_ROLE) {
      navigate(SUCCESS_REDIRECT, { replace: true });
    }
  }, [navigate]);


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await fetch(ACCOUNT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const responseData = await response.json();
    console.log("API Response:", responseData);

    if (!response.ok) {
      const errorMessage = responseData.statusMsg || "Tài khoản hoặc mật khẩu không hợp lệ.";
      throw new Error(errorMessage);
    }

    // 1. Lưu thông tin account
    localStorage.setItem("accountId", responseData.accountId);
    localStorage.setItem("role", responseData.role);

    // 2. Điều hướng dựa trên quyền
    if (responseData.role === "DeliveryUnit") {
      navigate("/delivery-orders");  // Trang đơn vị vận chuyển
    } else if (responseData.role === "Shipper") {
      navigate("/shipper-dashboard"); // Trang shipper
    } else {
      throw new Error("Tài khoản này không có quyền truy cập hợp lệ.");
    }

  } catch (err) {
    console.error("Lỗi trong quá trình đăng nhập:", err.message);
    setError(err.message);
  }
};



  // --- Giao diện sử dụng HOÀN TOÀN Tailwind CSS ---
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-100">
        
        {/* Tiêu đề */}
        <div className="flex items-center justify-center space-x-2 mb-8">
            <FaTruck className="text-4xl text-indigo-600"/> {/* Đã đổi từ FaTruckFast sang FaTruck */}
            <h1 className="text-3xl font-extrabold text-gray-800">
                Đơn Vị Vận Chuyển
            </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="relative mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-indigo-500/50 transition duration-150 ease-in-out placeholder-gray-500"
              placeholder="Email Đơn vị"
            />
          </div>

          {/* Password Input */}
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-indigo-500/50 transition duration-150 ease-in-out placeholder-gray-500 pr-10"
              placeholder="Mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center mb-8 text-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="mr-2 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="text-gray-600 select-none">
                Ghi nhớ đăng nhập
              </label>
            </div>
            {/* Có thể bỏ qua liên kết Quên mật khẩu nếu không có chức năng này */}
            <div className="text-indigo-600 hover:text-indigo-800 hover:underline transition">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </div>
          
          {/* Hiển thị lỗi */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 text-center rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Nút Đăng nhập */}
          <div className="mb-4">
            <button
              type="submit"
              className="w-full py-3 px-4 text-lg font-semibold text-white rounded-lg 
                       bg-gradient-to-r from-purple-600 to-indigo-700 
                       shadow-md shadow-indigo-300 hover:from-purple-700 hover:to-indigo-800 
                       focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition transform active:scale-95"
            >
              Đăng nhập
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default DeliveryUnitLogin;
