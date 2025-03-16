import React, { useState, useEffect } from "react";
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";

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
        <div className="flex h-screen">
          <SideNav />
          <div className="flex-1 flex flex-col"> {/* Đẩy nội dung qua bên phải */}
            <Header />
            <div className="flex justify-end p-6 pr-10">
              <div className="mt-20 bg-white shadow-lg rounded-lg p-6 w-4/5">
                <h2 className="text-xl font-semibold text-center mb-4">User Profile</h2>
                {notification.message && (
                  <div className={`p-2 text-white rounded mb-3 ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {notification.message}
                  </div>
                )}
                <div className="flex flex-col items-center mb-4">
                  <img src={user.avatar} alt="Avatar" className="w-40 h-40 rounded-full border-4 border-gray-300 mb-2" />
                  {isEditing && <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />}
                </div>
                <div className="space-y-3">
                  <label className="block">
                    Name:
                    <input 
                      type="text" 
                      name="name" 
                      value={user.name} 
                      onChange={handleInputChange} 
                      disabled={!isEditing} 
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </label>
                  <label className="block">
                    Email:
                    <input 
                      type="email" 
                      name="email" 
                      value={user.email} 
                      onChange={handleInputChange} 
                      disabled={!isEditing} 
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </label>
                  <label className="block">
                    Phone:
                    <input 
                      type="text" 
                      name="phone" 
                      value={user.phone} 
                      onChange={handleInputChange} 
                      disabled={!isEditing} 
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </label>
                  <label className="block">
                    Address:
                    <input 
                      type="text" 
                      name="address" 
                      value={user.address} 
                      onChange={handleInputChange} 
                      disabled={!isEditing} 
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </label>
                </div>
                <button 
                  onClick={toggleEdit} 
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
};

export default Profile;