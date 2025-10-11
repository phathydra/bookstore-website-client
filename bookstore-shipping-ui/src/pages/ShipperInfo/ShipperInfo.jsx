import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField, Button, CircularProgress, Card, CardContent,
  Typography, Box, FormControl, InputLabel, Select, MenuItem, Avatar
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Icon mới
import DeliveryUnitHeader from "../DeliveryUnitHeader"; // Dùng chung header

const API_HOST = "https://provinces.open-api.vn/api/";

// Tùy chỉnh Cloudinary của bạn (Thay thế bằng thông tin thực tế!)
const CLOUDINARY_CLOUD_NAME = "dfsxqmwkz"; // Tên Cloud
const CLOUDINARY_UPLOAD_PRESET = "Upload_image"; // Tên Preset

const ShipperInfo = () => {
  const navigate = useNavigate();
  const shipperId = localStorage.getItem("accountId");
  const apiUrl = "http://localhost:8084/api/shipping/shipInfor";

  // ===== STATE CƠ BẢN =====
  const [info, setInfo] = useState({
    id: "",
    shipperId: "",
    name: "",
    phone: "",
    address: "",
    avatar: "", // URL avatar
    latitude: "",
    longitude: "",
  });

  const [detailAddress, setDetailAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false); // STATE MỚI
  const [message, setMessage] = useState("");

  // ===== STATE ĐỊA LÝ (Giữ nguyên) =====
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");

  // ===== HEADER MENU (Giữ nguyên) =====
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    localStorage.clear();
    navigate("/");
  };
  const handleGoBack = () => navigate("/shipper-dashboard"); // Đã sửa đường dẫn trả về Dashboard
  const handleGoToInfo = () => handleMenuClose();

  // ===== HÀM TẢI ĐỊA LÝ (Giữ nguyên) =====
  const fetchDistricts = useCallback(async (cityCode) => {
    setDistricts([]);
    setWards([]);
    if (!cityCode) return;
    try {
      const res = await axios.get(`${API_HOST}p/${cityCode}?depth=2`);
      setDistricts(res.data.districts || []);
    } catch (err) {
      console.error("Lỗi tải Quận/Huyện:", err);
    }
  }, []);

  const fetchWards = useCallback(async (districtCode) => {
    setWards([]);
    if (!districtCode) return;
    try {
      const res = await axios.get(`${API_HOST}d/${districtCode}?depth=2`);
      setWards(res.data.wards || []);
    } catch (err) {
      console.error("Lỗi tải Phường/Xã:", err);
    }
  }, []);

  // ===== HÀM XỬ LÝ TẢI ẢNH MỚI LÊN CLOUDINARY =====
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMessage("⏳ Đang tải ảnh lên...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "Lỗi tải ảnh Cloudinary.");
        }

        // Cập nhật URL avatar mới vào state info
        setInfo(prevInfo => ({ ...prevInfo, avatar: data.secure_url }));
        setMessage("✅ Tải ảnh lên thành công. Nhấn 'Cập nhật' để lưu!");
        
    } catch (error) {
        console.error("Error uploading image:", error);
        setMessage("❌ Lỗi khi tải ảnh: " + error.message);
    } finally {
        setUploadingAvatar(false);
        setTimeout(() => setMessage(""), 5000);
    }
  };

  // ===== FETCH THÔNG TIN SHIPPER (Giữ nguyên) =====
  useEffect(() => {
    if (localStorage.getItem("role") !== "Shipper") {
      navigate("/");
      return;
    }
    // ... (Code fetch provinces và fetchInfo giữ nguyên)
    const fetchProvinces = async () => {
        try {
          const res = await axios.get(`${API_HOST}?depth=1`);
          setProvinces(res.data);
        } catch (e) {
          console.error("Lỗi tải Tỉnh/TP:", e);
        }
      };
  
      const fetchInfo = async () => {
        try {
          if (!shipperId) return;
          const res = await axios.get(`${apiUrl}/${shipperId}`);
          const data = res.data;
  
          setInfo({
            id: data.id || "",
            shipperId: data.shipperId || "",
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            avatar: data.avatar || "",
            latitude: data.latitude || "",
            longitude: data.longitude || "",
          });
  
          const parts = (data.address || "").split(",").map((p) => p.trim());
          let detail = data.address || "";
          if (parts.length > 3) detail = parts.slice(0, parts.length - 3).join(", ");
          setDetailAddress(detail);
        } catch (err) {
          console.error("Lỗi khi tải thông tin:", err);
          setMessage("❌ Không thể tải thông tin Shipper. Kiểm tra backend (8084).");
        } finally {
          setLoading(false);
        }
      };

    fetchProvinces();
    fetchInfo();
  }, [shipperId, navigate]);

  // ===== CẬP NHẬT THÔNG TIN (Giữ nguyên) =====
  const handleUpdate = async () => {
    setUpdating(true);
    setMessage("");

    const city = provinces.find((p) => p.code === Number(selectedCityCode));
    const district = districts.find((d) => d.code === Number(selectedDistrictCode));
    const ward = wards.find((w) => w.code === Number(selectedWardCode));

    let newAddress = info.address;

    if (selectedCityCode || selectedDistrictCode || selectedWardCode) {
      if (ward && district && city && detailAddress.trim()) {
        newAddress = `${detailAddress.trim()}, ${ward.name}, ${district.name}, ${city.name}`;
      } else {
        setMessage("❌ Vui lòng chọn đầy đủ 3 cấp địa chỉ và nhập chi tiết.");
        setUpdating(false);
        return;
      }
    } else if (detailAddress.trim() !== info.address.split(",").map(p => p.trim()).slice(0, -3).join(", ").trim()) {
      const parts = info.address.split(",").map((p) => p.trim());
      const geo = parts.length >= 3 ? parts.slice(-3).join(", ") : "";
      newAddress = geo ? `${detailAddress.trim()}, ${geo}` : detailAddress.trim();
    } else if (!detailAddress.trim() && info.address.trim()) {
       // Xử lý trường hợp người dùng xóa hết chi tiết nhưng không chọn lại địa chỉ
        setMessage("❌ Vui lòng nhập Địa chỉ chi tiết nếu không chọn lại từ đầu.");
        setUpdating(false);
        return;
    }
    
    // Tạo data với avatar đã được update (nếu có)
    const updatedData = {
        id: info.id, 
        shipperId: info.shipperId,
        latitude: info.latitude,
        longitude: info.longitude,
        
        name: info.name,
        phone: info.phone,
        address: newAddress, 
        avatar: info.avatar, // Lấy URL avatar mới nhất từ state info
    };

    try {
        await axios.put(`${apiUrl}/${shipperId}`, updatedData); 
        
        setInfo(updatedData);
        setMessage("✅ Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setMessage(`❌ Lỗi khi cập nhật thông tin. Vui lòng kiểm tra Back-end API (PUT ${apiUrl}/${shipperId}).`);
    } finally {
      setUpdating(false);
    }
  };

  // ===== RENDER =====
  if (loading) return <div className="flex justify-center mt-20"><CircularProgress /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <DeliveryUnitHeader
        userId={shipperId}
        anchorEl={anchorEl}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        handleGoToInfo={handleGoToInfo}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex justify-center py-10 px-4">
        <div className="max-w-lg w-full">
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
            >
              Quay lại Dashboard
            </Button>
          </Box>

          <Card className="shadow-lg">
            <CardContent>
              <Typography variant="h5" className="text-center mb-6 font-semibold text-indigo-700">
                Quản lý thông tin Shipper
              </Typography>

              {/* SỬA PHẦN AVATAR */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <Avatar 
                    src={info.avatar || 'https://via.placeholder.com/90'} 
                    sx={{ width: 90, height: 90 }} 
                  />
                  
                  {/* INPUT FILE ẨN */}
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload-button"
                    type="file"
                    onChange={handleImageChange}
                  />

                  {/* LABEL (Nút bấm) */}
                  <label 
                    htmlFor="avatar-upload-button"
                    className="absolute bottom-0 right-0 p-1 rounded-full bg-indigo-600 text-white shadow-md cursor-pointer hover:bg-indigo-700 transition"
                  >
                    {uploadingAvatar ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        <CloudUploadIcon fontSize="small" />
                    )}
                  </label>

                </div>
              </div>
              
              {/* END SỬA PHẦN AVATAR */}


              <div className="space-y-4">
                <TextField
                  fullWidth
                  label="Tên Shipper"
                  value={info.name}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={info.phone}
                  onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Địa chỉ chi tiết"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                />

                <FormControl fullWidth>
                  <InputLabel>Tỉnh/Thành phố</InputLabel>
                  <Select value={selectedCityCode} onChange={(e) => {
                    setSelectedCityCode(e.target.value);
                    fetchDistricts(e.target.value);
                    setSelectedDistrictCode("");
                    setSelectedWardCode("");
                  }}>
                    <MenuItem value="">-- Chọn Tỉnh/Thành phố --</MenuItem>
                    {provinces.map((p) => (
                      <MenuItem key={p.code} value={p.code}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!selectedCityCode}>
                  <InputLabel>Quận/Huyện</InputLabel>
                  <Select value={selectedDistrictCode} onChange={(e) => {
                    setSelectedDistrictCode(e.target.value);
                    fetchWards(e.target.value);
                    setSelectedWardCode("");
                  }}>
                    <MenuItem value="">-- Chọn Quận/Huyện --</MenuItem>
                    {districts.map((d) => (
                      <MenuItem key={d.code} value={d.code}>{d.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!selectedDistrictCode}>
                  <InputLabel>Phường/Xã</InputLabel>
                  <Select value={selectedWardCode} onChange={(e) => setSelectedWardCode(e.target.value)}>
                    <MenuItem value="">-- Chọn Phường/Xã --</MenuItem>
                    {wards.map((w) => (
                      <MenuItem key={w.code} value={w.code}>{w.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="caption" color="textSecondary">
                  Địa chỉ hiện tại: {info.address}
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleUpdate}
                  disabled={updating || uploadingAvatar} // Thêm điều kiện disabled khi đang tải ảnh
                  sx={{ mt: 2, backgroundColor: "#4f46e5" }}
                >
                  {(updating || uploadingAvatar) ? <CircularProgress size={24} color="inherit" /> : "Cập nhật thông tin"}
                </Button>

                {message && <p className="text-center mt-3 text-sm text-gray-700">{message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShipperInfo;