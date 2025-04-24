import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./style.css";

const Login = () => {
  const [email, setEmail] = useState("");  // Sửa từ username thành email
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await fetch("http://localhost:8080/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const responseData = await response.json();
      console.log("API Response:", responseData);  // Log entire response
  
      if (!response.ok) {
        throw new Error(responseData.statusMsg || "Invalid credentials");
      }
  
      // Check if role is present and if it is "Admin"
      if (responseData.role !== "Admin") {
        console.log("User is not Admin, role: ", responseData.role);  // Log role to check value
        throw new Error("You do not have admin rights");
      }
  
      // If role is Admin, save accountId and role in localStorage
      localStorage.setItem("accountId", responseData.accountId);
      localStorage.setItem("role", responseData.role);
  
      navigate("/book-management");  // Redirect if logged in successfully
    } catch (error) {
      console.error("Error during login:", error);
      setError(error.message);
    }
  };
  

  return (
    <div className="h-screen flex justify-center items-center bg-gray-200">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <div className="text-3xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600 mb-8">
          Login Form
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="email"
              value={email}  // Sửa thành email
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email"
            />
          </div>
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
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="mr-2"
              />
              <label htmlFor="remember-me" className="text-gray-600">
                Remember me
              </label>
            </div>
            <div className="text-blue-600 hover:underline">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </div>
          {error && <div className="mb-6 text-red-500 text-center">{error}</div>}
          <div className="mb-6">
            <input
              type="submit"
              value="Login"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none"
            />
          </div>
          <div className="text-center text-gray-600">
            Not a member?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Signup now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
