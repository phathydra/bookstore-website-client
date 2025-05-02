import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "./style.css"; // Assuming your custom styles are still in place

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => { // Make handleSubmit an async function
    e.preventDefault();

    // Simple email validation
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(""); // Clear previous error

    try {
      const response = await fetch(
        `http://localhost:8080/api/account/reset-password?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Or whatever content type your server expects
          },
          // You might not need a body for a GET request with query parameters
          // body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        alert("Password reset email has been sent!");
        setEmail(""); // Clear the email input
        navigate("/login"); // Redirect to the login page after successful request
      } else {
        const data = await response.json();
        setError(data.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-200">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <div className="text-3xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600 mb-8">
          Forgot Password
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email" // Changed placeholder for clarity
            />
            {/* You can remove the label if you prefer the placeholder */}
            {/* <label className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              Enter your email
            </label> */}
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="mb-6">
            <input
              type="submit"
              value="Reset Password"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none"
            />
          </div>

          <div className="text-center text-gray-600">
            Remembered your password?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;