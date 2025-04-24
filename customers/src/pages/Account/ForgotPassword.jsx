import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import backgroundImage from "../../pages/Account/background.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/api/account/reset-password?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        alert("Password reset email has been sent!");
        setEmail("");
        setError("");
        navigate("/login");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An error occurred while resetting password.");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center relative overflow-hidden"> {/* Thêm overflow-hidden */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          filter: "blur(5px)",
          zIndex: -2, // Đảm bảo lớp phủ ở phía sau tất cả nội dung
        }}
      ></div>
      <div className="absolute top-0 left-0 w-full !p-4 z-10"> </div>
      <div className="w-full max-w-md bg-white !p-8 rounded-lg shadow-lg !z-10">
        <div className="text-3xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600 !mb-8">
          Forgot Password
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full !p-3 border border-gray-300 !rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email"
            />
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="!mb-6">
            <input
              type="submit"
              value="Reset Password"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none"
            />
          </div>

          <div className="text-center text-gray-600">
            Remembered your password?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-light">
              Login now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;