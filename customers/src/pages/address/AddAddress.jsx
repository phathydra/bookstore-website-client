import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddAddress.css";

const API_HOST = "https://provinces.open-api.vn/api/";

const AddAddress = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    recipientName: "", // Thêm tên người nhận
    country: "Vietnam",
    city: { code: "", name: "" },
    district: { code: "", name: "" },
    ward: { code: "", name: "" },
    note: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    axios.get(`${API_HOST}?depth=1`).then((res) => {
      setProvinces(res.data);
    });
  }, []);

  const handleCityChange = async (e) => {
    const cityCode = e.target.value;
    const city = provinces.find((p) => p.code === Number(cityCode));
    setFormData({
      ...formData,
      city: { code: cityCode, name: city ? city.name : "" },
      district: { code: "", name: "" },
      ward: { code: "", name: "" },
    });

    setDistricts([]);
    setWards([]);

    if (cityCode) {
      const res = await axios.get(`${API_HOST}p/${cityCode}?depth=2`);
      setDistricts(res.data.districts);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const district = districts.find((d) => d.code === Number(districtCode));
    setFormData({
      ...formData,
      district: { code: districtCode, name: district ? district.name : "" },
      ward: { code: "", name: "" },
    });

    setWards([]);

    if (districtCode) {
      const res = await axios.get(`${API_HOST}d/${districtCode}?depth=2`);
      setWards(res.data.wards);
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const ward = wards.find((w) => w.code === Number(wardCode));
    setFormData({
      ...formData,
      ward: { code: wardCode, name: ward ? ward.name : "" },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const accountId = localStorage.getItem("accountId");
    if (!accountId) {
      console.error("Lỗi: Không tìm thấy accountId, vui lòng đăng nhập lại!");
      return;
    }
  
    const addressData = {
      accountId,
      phoneNumber: formData.phoneNumber,
      recipientName: formData.recipientName, // Gửi tên người nhận lên API
      country: formData.country,
      city: formData.city.name,
      district: formData.district.name,
      ward: formData.ward.name,
      note: formData.note,
      status: "INACTIVE", // Trạng thái mặc định là INACTIVE
    };
  
    console.log("Dữ liệu gửi:", addressData);
  
    try {
      const response = await axios.post(
        "http://localhost:8080/api/address/create",
        addressData
      );
  
      console.log("Đã thêm địa chỉ:", response.data);
      onAdd(response.data);
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
    }
  };
  

  return (
    <div className="add-address-container">
      <h2>Thêm địa chỉ mới</h2>
      <form onSubmit={handleSubmit}>
        <label>Tên người nhận:</label>
        <input
          type="text"
          value={formData.recipientName}
          onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
          required
        />

        <label>SĐT:</label>
        <input
          type="text"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          required
        />

        <label>Tỉnh/Thành phố:</label>
        <select value={formData.city.code} onChange={handleCityChange} required>
          <option value="">Chọn tỉnh/thành phố</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>

        <label>Quận/Huyện:</label>
        <select value={formData.district.code} onChange={handleDistrictChange} required>
          <option value="">Chọn quận/huyện</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>

        <label>Phường/Xã:</label>
        <select value={formData.ward.code} onChange={handleWardChange} required>
          <option value="">Chọn phường/xã</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>

        <label>Ghi chú:</label>
        <input
          type="text"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />

        <div className="button-group">
          <button type="submit">Thêm địa chỉ</button>
          <button type="button" onClick={onClose}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddress;
