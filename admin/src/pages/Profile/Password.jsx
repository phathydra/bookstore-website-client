import React, { useState } from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import SideNavProfile from '../../components/SideNav/SideNavProfile';

const Password = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match!');
      return;
    }
    // Perform password validation logic here
    console.log('Password changed successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-white shadow-md z-50 border-r-2 border-gray-300">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex">
        <Header title="Change Password" />

        <div className="p-2 pt-20 flex w-full">
          <div className="w-1/4">
            <SideNavProfile />
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl border-2 border-gray-300 ml-4 h-80 overflow-hidden rounded-lg">
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handlePasswordChange}
                className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Password;
