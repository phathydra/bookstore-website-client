import React, { useState } from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header'; 
import SideNavProfile from '../../components/SideNav/SideNavProfile';

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '123-456-7890',
    address: '123 Main Street',
  });
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150');

  const handleEdit = (field) => {
    setEditField(field);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [editField]: e.target.value,
    });
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setEditField(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-white shadow-md z-50 border-r-2 border-gray-300">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex">
        <Header title="Profile" />

        <div className="p-2 pt-20 flex w-full">
          <div className="w-1/4">
            <SideNavProfile />
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl border-2 border-gray-300 ml-4">
            <div className="flex flex-col items-center justify-center mb-8">
              <img
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 shadow-md"
                src={avatar}
                alt="Profile Avatar"
              />
              <input
                type="file"
                onChange={handleAvatarChange}
                className="mt-4 p-2 border border-gray-300 rounded-md w-48"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Name:</span>
                <div className="flex items-center space-x-2">
                  <span>{formData.name}</span>
                  <button
                    onClick={() => handleEdit('name')}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Email:</span>
                <div className="flex items-center space-x-2">
                  <span>{formData.email}</span>
                  <button
                    onClick={() => handleEdit('email')}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Phone:</span>
                <div className="flex items-center space-x-2">
                  <span>{formData.phone}</span>
                  <button
                    onClick={() => handleEdit('phone')}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Address:</span>
                <div className="flex items-center space-x-2">
                  <span>{formData.address}</span>
                  <button
                    onClick={() => handleEdit('address')}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 border-2 border-gray-300">
              <h3 className="text-xl font-semibold mb-4">Edit {editField}</h3>
              <input
                type="text"
                value={formData[editField]}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
