import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icon mắt
import "./style.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    setError("");

    try {
      const response = await axios.post("http://localhost:8080/api/account/create", {
        username,
        password,
        role: "User", // Quyền mặc định
      });

      if (response.status === 201) {
        alert("Đăng ký thành công! Chuyển đến trang đăng nhập...");
        navigate("/login"); // Điều hướng đến trang login
      }
    } catch (error) {
      setError(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-200">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <div className="text-3xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600 mb-8">
          Signup Form
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Username"
            />
          </div>

          {/* Input Password có icon mắt */}
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {/* Input Confirm Password có icon mắt */}
          <div className="relative mb-6">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              placeholder="Confirm Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="mb-6">
            <input
              type="submit"
              value="Signup"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none"
            />
          </div>
          <div className="text-center text-gray-600">
            Already a member?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">Login now</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
