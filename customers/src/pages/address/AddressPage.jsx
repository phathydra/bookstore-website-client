import React, { useEffect, useState } from "react";
import AddAddress from "./AddAddress"; // Import form thêm địa chỉ mới
import "./AddressPage.css";
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

      // Thông báo xóa thành công
      setSuccessMessage("Đã xóa địa chỉ thành công!");

      // Tải lại danh sách địa chỉ từ API
      fetchAddresses();

      // Tắt thông báo sau 3 giây
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

  // Handle click to set ACTIVE address
  const handleSetActiveAddress = async (addressId) => {
    // Kiểm tra ID không hợp lệ
    if (!addressId) {
      console.error("ID không hợp lệ:", addressId);
      setError("ID không hợp lệ");
      return;
    }

    try {
      // Lấy accountId của địa chỉ
      const accountId = localStorage.getItem("accountId");

      // Cập nhật trạng thái của tất cả các địa chỉ có cùng accountId thành 'INACTIVE'
      const updatedAddresses = addresses.map((address) =>
        address.accountId === accountId
          ? { ...address, status: address.id === addressId ? "ACTIVE" : "INACTIVE" } // Đặt ACTIVE cho địa chỉ được chọn, INACTIVE cho các địa chỉ còn lại
          : address
      );
      setAddresses(updatedAddresses); // Cập nhật danh sách địa chỉ trong state

      // Gửi yêu cầu PUT cho từng địa chỉ để cập nhật trạng thái
      for (const address of updatedAddresses) {
        const response = await fetch(`http://localhost:8080/api/address/updateStatus/${address.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: address.status }), // Gửi trạng thái của từng địa chỉ
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Lỗi khi cập nhật trạng thái:", errorData);
          setError(`Không thể cập nhật trạng thái: ${errorData.message || "Lỗi không xác định"}`);
          return; // Nếu có lỗi, dừng lại
        }
      }

      // Nếu tất cả đều thành công, thông báo cho người dùng
      setSuccessMessage("Địa chỉ mặc định đã được cập nhật.");
    } catch (error) {
      console.error("Lỗi khi kết nối đến server:", error);
      setError("Đã xảy ra lỗi khi cập nhật trạng thái. Vui lòng thử lại!");
    }
  };

  return (
    <div className="address-container">
      <h2>Danh sách địa chỉ nhận hàng</h2>
      {error && <p className="error-message">Lỗi: {error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <button onClick={() => setIsAddingAddress(true)} className="add-btn">
        + Thêm địa chỉ mới
      </button>

      <div className="address-list">
        {addresses.map((address) => (
          <div key={address._id || address.id} className="address-card">
            <div>
              <strong>{address.recipientName}</strong> {/* Hiển thị tên người nhận */}
              <p>{address.city}, {address.district}, {address.ward}</p>
              <p>SĐT: {address.phoneNumber}</p>
              <p>Ghi chú: {address.note}</p>
              <button
                onClick={() => handleSetActiveAddress(address._id || address.id)}
                className={`set-active-btn ${address.status === "ACTIVE" ? "active" : ""}`}
              >
                {address.status === "ACTIVE" ? "Địa chỉ mặc định" : "Chọn làm địa chỉ mặc định"}
              </button>
            </div>
            <div className="actions">
              <button
                onClick={() => {
                  console.log("Xóa địa chỉ ID:", address._id || address.id);
                  if (address._id || address.id) {
                    handleDelete(address._id || address.id);
                  } else {
                    console.error("ID địa chỉ không tồn tại.");
                  }
                }}
                className="delete-btn"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddingAddress && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddAddress onClose={() => setIsAddingAddress(false)} onAdd={fetchAddresses} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressPage;
