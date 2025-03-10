import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UpdateAddress.css";

const API_HOST = "https://provinces.open-api.vn/api/";

const UpdateAddress = ({ address, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    phoneNumber: address.phoneNumber,
    country: "Vietnam",
    city: { code: "", name: address.city },
    district: { code: "", name: address.district },
    ward: { code: "", name: address.ward },
    note: address.note,
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    axios.get(`${API_HOST}?depth=1`).then((res) => {
      setProvinces(res.data);
    });
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      const res = await axios.get(`${API_HOST}p/${address.cityCode}?depth=2`);
      setDistricts(res.data.districts);
    };

    const fetchWards = async () => {
      const res = await axios.get(`${API_HOST}d/${address.districtCode}?depth=2`);
      setWards(res.data.wards);
    };

    if (address.cityCode) fetchDistricts();
    if (address.districtCode) fetchWards();
  }, [address.cityCode, address.districtCode]);

  const handleCityChange = async (e) => {
    const cityCode = e.target.value;
    const city = provinces.find((p) => p.code === Number(cityCode));
    setFormData({
      ...formData,
      city: { code: cityCode, name: city?.name || "" },
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
      district: { code: districtCode, name: district?.name || "" },
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
      ward: { code: wardCode, name: ward?.name || "" },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const addressData = {
      id: address._id,
      phoneNumber: formData.phoneNumber,
      country: formData.country,
      city: formData.city.name,
      district: formData.district.name,
      ward: formData.ward.name,
      note: formData.note,
    };

    try {
      const response = await axios.put(`http://localhost:8080/api/address/update/${address._id}`, addressData);
      console.log("Cập nhật địa chỉ thành công:", response.data);
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
    }
  };

  return (
    <div className="update-address-container">
      <h2>Cập nhật địa chỉ</h2>
      <form onSubmit={handleSubmit}>
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
          <button type="submit">Cập nhật</button>
          <button type="button" onClick={onClose}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateAddress;
