import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./style.css"; // Assuming your custom styles are still in place

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu và xác nhận mật khẩu có khớp không
    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    setError("");
    // Handle form submission (thực hiện đăng ký)
    console.log("Email:", email);
    console.log("Password:", password);
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              Email Address
            </label>
          </div>
          <div className="relative mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              Password
            </label>
          </div>
          <div className="relative mb-6">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              Confirm Password
            </label>
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
