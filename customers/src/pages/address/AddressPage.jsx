import React, { useEffect, useState } from "react";
import AddAddress from "./AddAddress";
import UpdateAddress from "./UpdateAddress";

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = () => {
    const accountId = localStorage.getItem("accountId");
    if (accountId) {
      fetch(`http://localhost:8080/api/address?accountId=${accountId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Danh sách địa chỉ từ API:", data);
          setAddresses(data);
        })
        .catch((error) => setError(error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error("ID không hợp lệ:", id);
      setError("ID không hợp lệ");
      return;
    }

    try {
      console.log("Đang xóa địa chỉ với ID:", id);
      const response = await fetch(`http://localhost:8080/api/address/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Lỗi khi xóa:", errorMessage);
        throw new Error(`Không thể xóa địa chỉ: ${errorMessage}`);
      }

      setAddresses((prevAddresses) => prevAddresses.filter((address) => address._id !== id));

      setSuccessMessage("Đã xóa địa chỉ thành công!");

      fetchAddresses();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      console.log("Đã xóa địa chỉ thành công với ID:", id);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateClick = (address) => {
    setSelectedAddress(address);
    setIsUpdating(true);
  };

  const handleSetActiveAddress = async (addressId) => {
    if (!addressId) {
      console.error("ID không hợp lệ:", addressId);
      setError("ID không hợp lệ");
      return;
    }

    try {
      const accountId = localStorage.getItem("accountId");
      const updatedAddresses = addresses.map((address) =>
        address.accountId === accountId
          ? { ...address, status: address.id === addressId ? "ACTIVE" : "INACTIVE" }
          : address
      );
      setAddresses(updatedAddresses);

      for (const address of updatedAddresses) {
        const response = await fetch(`http://localhost:8080/api/address/updateStatus/${address.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: address.status }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Lỗi khi cập nhật trạng thái:", errorData);
          setError(`Không thể cập nhật trạng thái: ${errorData.message || "Lỗi không xác định"}`);
          return;
        }
      }

      setSuccessMessage("Địa chỉ mặc định đã được cập nhật.");
    } catch (error) {
      console.error("Lỗi khi kết nối đến server:", error);
      setError("Đã xảy ra lỗi khi cập nhật trạng thái. Vui lòng thử lại!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Danh sách địa chỉ nhận hàng</h2>
      {error && <p className="text-red-500 mb-2">Lỗi: {error}</p>}
      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}

      <button
        onClick={() => setIsAddingAddress(true)}
        className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4"
      >
        + Thêm địa chỉ mới
      </button>

      <div className="max-h-96 overflow-y-auto">
        {addresses.map((address) => (
          <div key={address._id || address.id} className="bg-gray-100 p-4 rounded mb-4 flex justify-between items-center">
            <div>
              <strong className="block">{address.recipientName}</strong>
              <p className="text-sm">{address.city}, {address.district}, {address.ward}</p>
              <p className="text-sm">SĐT: {address.phoneNumber}</p>
              <p className="text-sm">Ghi chú: {address.note}</p>
              <button
                onClick={() => handleSetActiveAddress(address._id || address.id)}
                className={`mt-2 py-1 px-3 rounded text-sm ${address.status === "ACTIVE" ? "bg-green-500 text-white" : "bg-gray-300 hover:bg-gray-400"}`}
              >
                {address.status === "ACTIVE" ? "Địa chỉ mặc định" : "Chọn làm địa chỉ mặc định"}
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log("Xóa địa chỉ ID:", address._id || address.id);
                  if (address._id || address.id) {
                    handleDelete(address._id || address.id);
                  } else {
                    console.error("ID địa chỉ không tồn tại.");
                  }
                }}
                className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

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

export default AddressPage;