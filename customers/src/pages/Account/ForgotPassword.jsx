import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./style.css"; // Vẫn dùng style.css chung

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    console.log("Email:", email);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button">Reset Password</button>

          <div className="text-center">
            Remembered your password? <Link to="/login">Login now</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
