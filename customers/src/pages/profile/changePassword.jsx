import React, { useState } from "react";
import SideNavProfile from './SideNavProfile'; // Ensure the correct path

// Optionally, you can install `react-icons` if not already installed:
// npm install react-icons
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedTab, setSelectedTab] = useState('password'); // Default selected tab

  // State for toggling visibility of passwords
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleChangePassword = async () => {
    setMessage("");
    setMessageType("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage("Vui lòng điền đầy đủ thông tin.");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage("Mật khẩu mới và nhập lại mật khẩu mới không khớp.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setMessageType("error");
      return;
    }

    const accountId = localStorage.getItem("accountId");
    if (!accountId) {
      console.error("Không tìm thấy ID tài khoản. Vui lòng đăng nhập lại.");
      setMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/account/change-password?accountId=${accountId}&oldPassword=${currentPassword}&newPassword=${newPassword}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Đổi mật khẩu thành công!");
        setMessageType("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setMessage(data.statusMsg || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      setMessage("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      setMessageType("error");
    }
  };

  return (
    <div className="flex flex-col md:flex-row !gap-4 !p-4 !ml-30">
      {/* Sidebar */}
      <SideNavProfile selected={selectedTab} onSelect={setSelectedTab} />

      {/* Content */}
      <div className="!flex-1 !bg-white-100 !p-6 !rounded-xl shadow !mr-30">
        <h2 className="text-2xl font-semibold !mb-6 text-gray-800">Đổi mật khẩu</h2>
        {message && (
          <div className={`!mb-4 !p-3 !rounded-md font-semibold ${
            messageType === "success" ? "bg-green-100 text-green-700 border border-green-400" : "bg-red-100 text-red-700 border border-red-400"
          }`}>
            {message}
          </div>
        )}
        
        <div className="!mb-4">
          <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold !mb-2">
            Mật khẩu hiện tại*
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="!mb-4">
          <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold !mb-2">
            Mật khẩu mới*
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full !py-2 !px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="!mb-6">
          <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold !mb-2">
            Nhập lại mật khẩu mới*
          </label>
          <div className="relative">
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full !py-2 !px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button
          onClick={handleChangePassword}
          className="bg-red-500 hover:bg-red-700 text-white font-bold !py-2 !px-4 !rounded focus:outline-none focus:shadow-outline w-full"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
