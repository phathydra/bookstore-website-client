import React from 'react';

const SideNavProfile = () => {
  return (
    <div className="fixed top-[calc(4rem+1rem)] left-[17.3%] w-[21%] bg-white shadow-md border-r-2 border-gray-300 h-[calc(100vh-5rem)] overflow-hidden rounded-lg">
      <div className="w-full p-4">
        <ul className="space-y-2">
          <li>
            <a href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">
              Thông tin của tôi
            </a>
          </li>
          <li>
            <a href="/address" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">
              Địa chỉ
            </a>
          </li>
          <li>
            <a href="purchase-order" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">
              Đơn mua
            </a>
          </li>
          <li>
            <a href="change-password" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">
              Đổi mật khẩu
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideNavProfile;
