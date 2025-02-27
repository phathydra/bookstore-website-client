import React, { useState, useEffect } from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header'; 
import SideNavProfile from '../../components/SideNav/SideNavProfile';

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editField, setEditField] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const [formData, setFormData] = useState({
    accountId: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [tempData, setTempData] = useState({}); // State tạm thời cho modal
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const accountId = localStorage.getItem('accountId');

    if (!accountId) {
      console.error('No account ID found. Please log in again.');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/account/fetch?accountId=${accountId}`);
        
        if (!response.ok) throw new Error('Failed to fetch user data.');

        const data = await response.json();
        setFormData({
          accountId: data.accountId,
          name: data.name || 'John Doe',
          email: data.email || 'johndoe@example.com',
          phone: data.phone || '123-456-7890',
          address: data.address || '123 Main Street',
        });
        setAvatar(data.avatar || 'https://via.placeholder.com/150');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = (field) => {
    setEditField(field);
    setTempData({ ...formData }); // Copy dữ liệu vào tempData
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setTempData({ ...tempData, [editField]: e.target.value });
  };

  const handleSaveTemp = () => {
    setFormData({ ...tempData }); // Cập nhật state chính khi nhấn "Lưu"
    setIsModalOpen(false);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/account/update-information?accountId=${formData.accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update information.');

      setNotification({ message: 'Cập nhật thông tin thành công!', type: 'success' });

      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    } catch (error) {
      setNotification({ message: 'Có lỗi xảy ra khi cập nhật.', type: 'error' });

      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/6 bg-white shadow-md z-50 border-r-2 border-gray-300">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex">
        <Header title="Profile" />

        <div className="p-2 pt-20 flex w-full">
          <div className="w-1/4">
            <SideNavProfile />
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl border-2 border-gray-300 ml-4">
            {/* Hiển thị thông báo */}
            {notification.message && (
              <div className={`mb-4 p-2 text-white text-center rounded-md ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {notification.message}
              </div>
            )}

            <div className="flex flex-col items-center justify-center mb-8">
              <img
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 shadow-md"
                src={avatar}
                alt="Profile Avatar"
              />
              <input type="file" onChange={handleAvatarChange} className="mt-4 p-2 border border-gray-300 rounded-md w-48" />
            </div>

            <div className="space-y-4">
              {['name', 'email', 'phone', 'address'].map((field) => (
                <div key={field} className="flex justify-between items-center">
                  <span className="font-semibold">{capitalizeFirstLetter(field)}:</span>
                  <div className="flex items-center space-x-2">
                    <span>{formData[field]}</span>
                    <button onClick={() => handleEdit(field)} className="text-blue-500 text-sm hover:underline">Chỉnh sửa</button>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-6">
                <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 rounded-md">Cập nhật</button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Chỉnh sửa */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 border-2 border-gray-300">
              <h3 className="text-xl font-semibold mb-4">Chỉnh sửa {editField}</h3>
              <input type="text" value={tempData[editField]} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
              <div className="flex justify-end space-x-4 mt-4">
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:underline">Hủy</button>
                <button onClick={handleSaveTemp} className="bg-blue-500 text-white px-4 py-2 rounded-md">Lưu</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export default Profile;
