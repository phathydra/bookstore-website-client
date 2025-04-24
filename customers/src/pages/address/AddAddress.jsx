import React, { useState, useEffect } from "react";
import axios from "axios";

const API_HOST = "https://provinces.open-api.vn/api/";
const ADDRESS_API = "http://localhost:8080/api/address/create";

const AddAddress = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    phoneNumber: "", recipientName: "", country: "Vietnam",
    city: { code: "", name: "" }, district: { code: "", name: "" },
    ward: { code: "", name: "" }, note: "",
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    axios.get(`${API_HOST}?depth=1`).then(res => setProvinces(res.data));
  }, []);

  const handleCityChange = async (e) => {
    const cityCode = e.target.value;
    const city = provinces.find(p => p.code === Number(cityCode));
    setFormData({ ...formData, city: { code: cityCode, name: city?.name || "" }, district: { code: "", name: "" }, ward: { code: "", name: "" } });
    setDistricts([]); setWards([]);
    if (cityCode) {
      const res = await axios.get(`${API_HOST}p/${cityCode}?depth=2`);
      setDistricts(res.data.districts);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const district = districts.find(d => d.code === Number(districtCode));
    setFormData({ ...formData, district: { code: districtCode, name: district?.name || "" }, ward: { code: "", name: "" } });
    setWards([]);
    if (districtCode) {
      const res = await axios.get(`${API_HOST}d/${districtCode}?depth=2`);
      setWards(res.data.wards);
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const ward = wards.find(w => w.code === Number(wardCode));
    setFormData({ ...formData, ward: { code: wardCode, name: ward?.name || "" } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accountId = localStorage.getItem("accountId");
    if (!accountId) { console.error("Lỗi: Không tìm thấy accountId, vui lòng đăng nhập lại!"); return; }
    const addressData = { accountId, ...formData, city: formData.city.name, district: formData.district.name, ward: formData.ward.name, status: "INACTIVE" };
    try {
      const res = await axios.post(ADDRESS_API, addressData);
      onAdd(res.data); onClose();
    } catch (error) { console.error("Lỗi khi thêm địa chỉ:", error); }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">Thêm địa chỉ mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
        {["recipientName", "phoneNumber", "note"].map(field => (
            <div key={field} className="px-4"> {/* Thêm padding trái phải */}
              <label className="block text-sm font-medium text-gray-700">{field === "recipientName" ? "Tên người nhận:" : field === "phoneNumber" ? "SĐT:" : "Ghi chú:"}</label>
              <input type="text" value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} required={field !== "note" && field !== "note"} className="mt-1 p-2 border rounded-md w-full" />
            </div>
          ))}
          {[
            { label: "Tỉnh/Thành phố:", options: provinces, value: formData.city.code, onChange: handleCityChange },
            { label: "Quận/Huyện:", options: districts, value: formData.district.code, onChange: handleDistrictChange },
            { label: "Phường/Xã:", options: wards, value: formData.ward.code, onChange: handleWardChange },
          ].map(({ label, options, value, onChange }) => (
            <div key={label} className="px-4"> {/* Thêm padding trái phải */}
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <select value={value} onChange={onChange} required className="mt-1 p-2 border rounded-md w-full">
                <option value="">Chọn {label.toLowerCase().slice(0, -1)}</option>
                {options.map(o => (<option key={o.code} value={o.code}>{o.name}</option>))}
              </select>
            </div>
          ))}
          <div className="flex justify-center mt-4 mb-2"> {/* Thêm mt-4 để tăng khoảng cách lề trên */}
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Thêm địa chỉ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddress;