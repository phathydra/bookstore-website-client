import React, { useState, useEffect } from "react";
import SideNavProfile from './SideNavProfile';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('info');
    const [user, setUser] = useState({
        avatar: "https://via.placeholder.com/150",
        name: "",
        email: "",
        phone: "",
        address: "",
    });
    const [notification, setNotification] = useState({ message: "", type: "" });

    useEffect(() => {
        const accountId = localStorage.getItem("accountId");
        if (!accountId) {
            console.error("No account ID found. Please log in again.");
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/account/fetch?accountId=${accountId}`);
                if (!response.ok) throw new Error("Failed to fetch user data.");

                const data = await response.json();
                setUser(prevUser => ({
                    ...prevUser,
                    ...data,
                    avatar: data.avatar || "https://via.placeholder.com/150",
                }));
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prevUser => ({ ...prevUser, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Upload_image");
        formData.append("cloud_name", "dfsxqmwkz");

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/dfsxqmwkz/image/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error.message);

            setUser(prevUser => ({ ...prevUser, avatar: data.secure_url }));
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const toggleEdit = async () => {
        if (isEditing) {
            try {
                const accountId = localStorage.getItem("accountId");

                const response = await fetch(`http://localhost:8080/api/account/update-information?accountId=${accountId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user)
                });

                if (!response.ok) throw new Error("Failed to update user data.");

                setNotification({ message: "Cập nhật thông tin thành công!", type: "success" });
            } catch (error) {
                setNotification({ message: "Có lỗi xảy ra khi cập nhật.", type: "error" });
            }

            setTimeout(() => setNotification({ message: "", type: "" }), 3000);
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="flex flex-col md:flex-row !gap-4 !p-4 !ml-30">
            {/* Sidebar */}
            <SideNavProfile selected={selectedTab} onSelect={setSelectedTab} />

            {/* Content */}
            <div className="flex-1 bg-white p-6 rounded-xl shadow !mr-30">
                <h2 className="text-xl font-semibold mb-4">Thông tin tài khoản</h2>

                {notification.message && (
                    <div className={`mb-4 p-3 rounded-md font-semibold ${notification.type === "success" ? "bg-green-100 text-green-700 border border-green-400" : "bg-red-100 text-red-700 border border-red-400"}`}>
                        {notification.message}
                    </div>
                )}

                <div className="mb-4 flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                        <img src={user.avatar} alt="Avatar" className="object-cover w-full h-full" />
                        {isEditing && (
                            <div className="absolute bottom-0 left-0 w-full bg-gray-200 bg-opacity-70 text-center py-1 cursor-pointer">
                                <label htmlFor="image-upload" className="block text-sm text-gray-700">Đổi ảnh</label>
                                <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={user.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                        <input
                            type="text"
                            name="phone"
                            value={user.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                        <input
                            type="text"
                            name="address"
                            value={user.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                </div>

                <button onClick={toggleEdit} className={`!mt-4 bg-red-500 hover:bg-red-700 text-white font-bold !py-2 !px-4 !rounded focus:outline-none focus:shadow-outline ${isEditing ? '' : 'w-full'}`}>
                    {isEditing ? "Lưu" : "Lưu thay đổi"}
                </button>
            </div>
        </div>
    );
};

export default Profile;