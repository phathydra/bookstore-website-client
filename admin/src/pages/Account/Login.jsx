import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./style.css"; // Assuming your custom styles are still in place

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Remember Me:", rememberMe);
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
              {/* Use Link instead of <a> for routing */}
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </div>
          <div className="mb-6">
            <input
              type="submit"
              value="Login"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none"
            />
          </div>
          <div className="text-center text-gray-600">
            Not a member?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">Signup now</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
