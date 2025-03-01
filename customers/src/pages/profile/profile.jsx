import React, { useState, useEffect } from "react";
import "./profile.css";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
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
        formData.append("upload_preset", "Upload_image"); // Thay bằng đúng preset của bạn
        formData.append("cloud_name", "dfsxqmwkz"); // Cloudinary cloud_name
    
        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/dfsxqmwkz/image/upload", {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.error.message);
    
            setUser(prevUser => ({ ...prevUser, avatar: data.secure_url })); // Cập nhật ảnh mới vào state
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
                    body: JSON.stringify(user) // Gửi cả avatar mới
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
        <div className="user-profile">
            <h2>User Profile</h2>
            {notification.message && (
                <div className={`notification ${notification.type === "success" ? "success" : "error"}`}>
                    {notification.message}
                </div>
            )}
            <div className="profile-avatar">
                <img src={user.avatar} alt="Avatar" />
                {isEditing && <input type="file" accept="image/*" onChange={handleImageChange} />}
            </div>
            <div className="profile-info">
                <label>
                    Name:
                    <input 
                        type="text" 
                        name="name" 
                        value={user.name} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                    />
                </label>
                <label>
                    Email:
                    <input 
                        type="email" 
                        name="email" 
                        value={user.email} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                    />
                </label>
                <label>
                    Phone:
                    <input 
                        type="text" 
                        name="phone" 
                        value={user.phone} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                    />
                </label>
                <label>
                    Address:
                    <input 
                        type="text" 
                        name="address" 
                        value={user.address} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                    />
                </label>
            </div>
            <button onClick={toggleEdit} className="edit-button">
                {isEditing ? "Save" : "Edit"}
            </button>
        </div>
    );
};

export default Profile;
