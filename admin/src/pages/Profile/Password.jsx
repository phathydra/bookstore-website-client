import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Password = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false); // State cho việc thu gọn sidebar

    const handlePasswordChange = async () => {
        setError("");
        setMessage("");
        setMessageType("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới không trùng khớp!");
            return;
        }

        if (newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        const accountId = localStorage.getItem("accountId");
        if (!accountId) {
            console.error("Không tìm thấy ID tài khoản. Vui lòng đăng nhập lại.");
            setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/account/change-password?accountId=${accountId}&oldPassword=${oldPassword}&newPassword=${newPassword}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Đổi mật khẩu thành công!");
                setMessageType("success");
                setShowLogoutPrompt(true); // Hiển thị thông báo đăng xuất
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setCountdown(5); // Bắt đầu đếm ngược

                // Thiết lập bộ đếm thời gian tự động đăng xuất
                const timer = setTimeout(logout, 5000);

                // Cleanup function để xóa timer nếu component unmount hoặc người dùng nhấn nút đăng nhập
                return () => clearTimeout(timer);
            } else {
                setError(
                    data.statusMsg || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại."
                );
            }
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error);
            setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    };

    const handleLogoutNow = () => {
        logout();
    };

    const logout = () => {
        localStorage.removeItem("accountId");
        navigate("/login");
    };

    useEffect(() => {
        let intervalId;
        if (showLogoutPrompt && countdown > 0) {
            intervalId = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        } else if (showLogoutPrompt && countdown === 0) {
            logout(); // Tự động đăng xuất khi hết thời gian
        }
        return () => clearInterval(intervalId); // Cleanup interval
    }, [showLogoutPrompt, countdown, navigate]);

    const toggleOldPasswordVisibility = () => {
        setShowOldPassword(!showOldPassword);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-white shadow-md border-r border-gray-300 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-1/6'}`}
            >
                <SideNav onToggleCollapse={handleToggleCollapse} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginLeft: isCollapsed ? '5rem' : '16.666667%' }}>
                <Header title="Đổi Mật Khẩu" isCollapsed={isCollapsed} />

                {/* Form Section */}
                <div className="flex justify-center items-center h-full p-10">
                    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg border border-gray-300">
                        <h2 className="text-2xl font-semibold text-center mb-6">
                            Đổi Mật Khẩu
                        </h2>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        {message && !showLogoutPrompt && (
                            <p
                                className={`text-center mb-4 ${
                                    messageType === "success" ? "text-green-500" : "text-red-500"
                                }`}
                            >
                                {message}
                            </p>
                        )}

                        {showLogoutPrompt && (
                            <div className="text-center mb-4">
                                <p className="text-green-500 font-semibold">{message}</p>
                                <p>Bạn sẽ được đăng xuất sau <span className="font-bold">{countdown}</span> giây.</p>
                                <button
                                    onClick={handleLogoutNow}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition mt-2"
                                >
                                    Đăng nhập lại ngay
                                </button>
                            </div>
                        )}

                        {!showLogoutPrompt && (
                            <div className="space-y-5">
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        placeholder="Mật khẩu cũ"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-blue-500"
                                    />
                                    <span
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        onClick={toggleOldPasswordVisibility}
                                    >
                                        <FontAwesomeIcon icon={showOldPassword ? faEye : faEyeSlash} />
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-blue-500"
                                    />
                                    <span
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        onClick={toggleNewPasswordVisibility}
                                    >
                                        <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Xác nhận mật khẩu mới"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-blue-500"
                                    />
                                    <span
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        onClick={toggleConfirmPasswordVisibility}
                                    >
                                        <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                                    </span>
                                </div>

                                <button
                                    onClick={handlePasswordChange}
                                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                                >
                                    Xác nhận thay đổi
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Password;