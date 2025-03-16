import React, { useState } from "react";
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";

const Password = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không trùng khớp!");
      return;
    }
    console.log("Mật khẩu đã được thay đổi thành công!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-1/6 h-full bg-white shadow-md border-r border-gray-300 z-50">
        <SideNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-[20%]">
        <Header title="Đổi Mật Khẩu" />

        {/* Form Section */}
        <div className="flex justify-center items-center h-full p-10">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg border border-gray-300">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Đổi Mật Khẩu
            </h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <div className="space-y-5">
              <input
                type="password"
                placeholder="Mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-blue-500"
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-blue-500"
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-blue-500"
              />

              <button
                onClick={handlePasswordChange}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
              >
                Xác nhận thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Password;
