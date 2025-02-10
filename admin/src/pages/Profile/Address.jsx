import React, { useState } from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import SideNavProfile from '../../components/SideNav/SideNavProfile';

const Address = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Lê Thanh Hùng',
      phone: '(+84) 866 858 340',
      address: 'Bcon Plaza, 22a/6, Đường Thống Nhất Đông, Phường Đông Hòa, Thành Phố Dĩ An, Bình Dương',
      isDefault: true,
    },
    {
      id: 2,
      name: 'Lê Thanh Hùng',
      phone: '(+84) 866 858 340',
      address: 'Tạp hoá Cô Thương, Gần Trường Tiểu Học Bình Thắng B, Xã Bình Thắng, Huyện Bù Gia Mập, Bình Phước',
      isDefault: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [updatedAddress, setUpdatedAddress] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const handleSetDefault = (id) => {
    setAddresses(addresses.map(address => 
      address.id === id 
        ? { ...address, isDefault: true } 
        : { ...address, isDefault: false }
    ));
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const handleEdit = (address) => {
    setUpdatedAddress({
      name: address.name,
      phone: address.phone,
      address: address.address,
    });
    setCurrentAddress(address);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedAddress({
      ...updatedAddress,
      [name]: value,
    });
  };

  const handleSave = () => {
    if (currentAddress) {
      setAddresses(addresses.map(address =>
        address.id === currentAddress.id
          ? { ...address, ...updatedAddress }
          : address
      ));
    } else {
      setAddresses([...addresses, { ...updatedAddress, id: addresses.length + 1, isDefault: false }]);
    }
    setIsModalOpen(false);
    setCurrentAddress(null);
  };

  const handleAddNewAddress = () => {
    setUpdatedAddress({
      name: '',
      phone: '',
      address: '',
    });
    setCurrentAddress(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-white shadow-md z-50 border-r-2 border-gray-300">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex">
        <Header title="Addresses" />

        <div className="p-2 pt-20 flex w-full">
          <div className="w-1/4">
            <SideNavProfile />
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl border-2 border-gray-300 ml-4 relative">
            <button
              onClick={handleAddNewAddress}
              className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              + Thêm địa chỉ mới
            </button>
            <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '480px' }}>
              {addresses.map((address) => (
                <div key={address.id} className="flex justify-between items-center border-b py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold">{address.name}</span>
                    <span>{address.phone}</span>
                    <span>{address.address}</span>
                  </div>

                  <div className="flex space-x-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-green-500 text-sm hover:underline"
                      >
                        Thiết lập mặc định
                      </button>
                    )}

                    {address.isDefault && (
                      <span className="text-sm text-gray-500">Mặc định</span>
                    )}

                    <button
                      onClick={() => handleEdit(address)}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      Cập nhật
                    </button>

                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 border-2 border-gray-300">
            <h3 className="text-xl font-semibold mb-4">{currentAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
            <div>
              <div className="mb-4">
                <label className="block font-semibold">Tên:</label>
                <input
                  type="text"
                  name="name"
                  value={updatedAddress.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold">Số điện thoại:</label>
                <input
                  type="text"
                  name="phone"
                  value={updatedAddress.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold">Địa chỉ:</label>
                <input
                  type="text"
                  name="address"
                  value={updatedAddress.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:underline"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;
