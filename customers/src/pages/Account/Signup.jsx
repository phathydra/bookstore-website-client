import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./style.css";
import backgroundImage from "../../pages/Account/background.jpg"; 

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const sendConfirmationEmail = async (recipientEmail, accountId) => {
    try {
      const confirmationLink = `http://localhost:3001/activate?accountId=${accountId}`; // Đường dẫn frontend để kích hoạt
      await axios.post("http://localhost:8080/api/email/send", {
        to: recipientEmail,
        subject: "Xác nhận đăng ký Bookstore!",
        content: `Cảm ơn bạn đã đăng ký tài khoản tại Bookstore. Vui lòng nhấn vào <a href="${confirmationLink}">đây</a> để kích hoạt tài khoản của bạn.`,
      });
      console.log("Email xác nhận đã được gửi đến:", recipientEmail);
    } catch (error) {
      console.error("Lỗi khi gửi email xác nhận:", error);
      // Có thể thêm thông báo lỗi cho người dùng nếu cần thiết
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    setError("");

    try {
      const response = await axios.post("http://localhost:8080/api/account/create", {
        email,
        password,
        role: "User",
      });

      if (response.status === 201) {
        const accountId = response.data.accountId; // Lấy accountId từ response
        alert(`Đăng ký thành công!! Vui lòng kiểm tra email ${email} để kích hoạt tài khoản.`);
        sendConfirmationEmail(email, accountId); // Gửi email xác nhận với link
        navigate("/login"); // Hoặc có thể chuyển đến trang thông báo
      }
    } catch (error) {
      setError(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          filter: "blur(5px)",
          zIndex: -2,
        }}
      ></div>
      <div className="absolute top-0 left-0 w-full !p-4 z-10">
      </div>
      <div className="w-full max-w-md bg-white !p-8 !rounded-lg shadow-lg z-10">
        <div className="text-3xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600 mb-8">
          Signup Form
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative! mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full !p-3 border border-gray-300 !rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email"
            />
          </div>

          <div className="relative !mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full !p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
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

          <div className="relative !mb-6">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full !p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              placeholder="Confirm Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute !inset-y-0 !right-3 flex items-center text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="!mb-6">
            <input
              type="submit"
              value="Signup"
              className="w-full !py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none"
            />
          </div>
          <div className="text-center text-gray-600">
            Already a member?{" "}
            <Link to="/login" className="text-blue-600 !hover:underline !font-light">Login now</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;