import React, { useState } from "react";
import "./profile.css";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        avatar: "https://via.placeholder.com/150",
        name: "Nguyen Van A",
        email: "nguyenvana@example.com",
        phone: "0123456789",
        username: "nguyenvana",
        password: "password123"
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    return (
        <>
            <div className="user-profile">
                <h2>User Profile</h2>
                <div className="profile-avatar">
                    <img src={user.avatar} alt="Avatar" />
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
                        Username:
                        <input 
                            type="text" 
                            name="username" 
                            value={user.username} 
                            onChange={handleInputChange} 
                            disabled={!isEditing} 
                        />
                    </label>
                    <label>
                        Password:
                        <input 
                            type="password" 
                            name="password" 
                            value={user.password} 
                            onChange={handleInputChange} 
                            disabled={!isEditing} 
                        />
                    </label>
                </div>
                <button onClick={toggleEdit} className="edit-button">
                    {isEditing ? "Save" : "Edit"}
                </button>
            </div>
        </>
    );
};

export default Profile;
