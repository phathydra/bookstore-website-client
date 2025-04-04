import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AddAddress from "../../pages/address/AddAddress";

const AddressSelectionPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = () => {
    const accountId = localStorage.getItem("accountId");
    if (accountId) {
      fetch(`http://localhost:8080/api/address?accountId=${accountId}`)
        .then((res) => res.json())
        .then((data) => {
          setAddresses(data);
        })
        .catch((error) => setError(error.message));
    }
  };

  const handleAddressSelect = (selectedAddress) => {
    navigate("/orderdetail", {
      state: {
        ...(location.state || {}), // Sử dụng location.state nếu tồn tại, nếu không thì dùng object rỗng.
        address: selectedAddress,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Chọn địa chỉ giao hàng</h2>
      {error && <p className="text-red-500 mb-2">Lỗi: {error}</p>}
      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}

      <div className="max-h-96 overflow-y-auto">
        {addresses.map((address) => (
          <div key={address._id || address.id} className="bg-gray-100 p-4 rounded mb-4 flex justify-between items-center">
            <div>
              <strong className="block">{address.recipientName}</strong>
              <p className="text-sm">
                {address.city}, {address.district}, {address.ward}
              </p>
              <p className="text-sm">SĐT: {address.phoneNumber}</p>
              <p className="text-sm">Ghi chú: {address.note}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAddressSelect(address)}
                className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
              >
                Chọn
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsAddingAddress(true)}
        className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mt-4"
      >
        + Thêm địa chỉ mới
      </button>

      {isAddingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <AddAddress onClose={() => setIsAddingAddress(false)} onAdd={fetchAddresses} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelectionPage;