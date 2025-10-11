import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
    TextField, Button, CircularProgress, Card, CardContent, Typography, 
    Box, FormControl, InputLabel, Select, MenuItem 
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeliveryUnitHeader from '../DeliveryUnitHeader';

// --- HẰNG SỐ API ĐỊA LÝ ---
const API_HOST = "https://provinces.open-api.vn/api/";

const DeliveryUnitInfo = () => {
    const navigate = useNavigate();
    const deliveryUnitId = localStorage.getItem("accountId");
    const apiUrl = "http://localhost:8084/api/shipping/delivery-units";

    // --- STATES CƠ BẢN ---
    const [info, setInfo] = useState({
        id: "",
        deliveryUnitId: "",
        name: "",
        email: "",
        phone: "",
        branchAddress: "" // Địa chỉ đầy đủ (ví dụ: "Số 123, Xã A, Huyện B, Tỉnh C")
    });
    // STATE MỚI: Chỉ lưu phần địa chỉ chi tiết (VD: "Số nhà, Tên đường")
    const [detailAddress, setDetailAddress] = useState(""); 
    
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState("");

    // --- STATES ĐỊA CHỈ CHO SELECT ---
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedCityCode, setSelectedCityCode] = useState("");
    const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
    const [selectedWardCode, setSelectedWardCode] = useState("");

    // --- Hàm xử lý cho Header/Menu (Giữ nguyên) ---
    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleGoToDashboard = () => {
        handleMenuClose();
        navigate('/DeliveryUnitInfo'); 
    };

    const handleLogout = () => { 
        handleMenuClose();
        localStorage.removeItem("accountId"); 
        localStorage.removeItem("role"); 
        navigate('/'); 
    };

    const handleGoBack = () => {
        navigate('/delivery-orders');
    };
    // ------------------------------------------

    // --- HÀM TẢI DỮ LIỆU ĐỊA LÝ (Giữ nguyên) ---
    const fetchDistricts = useCallback(async (cityCode) => {
        setDistricts([]);
        setWards([]);
        if (!cityCode) return;
        try {
            const res = await axios.get(`${API_HOST}p/${cityCode}?depth=2`);
            setDistricts(res.data.districts || []);
        } catch (error) {
            console.error("Lỗi khi tải Quận/Huyện:", error);
        }
    }, []);

    const fetchWards = useCallback(async (districtCode) => {
        setWards([]);
        if (!districtCode) return;
        try {
            const res = await axios.get(`${API_HOST}d/${districtCode}?depth=2`);
            setWards(res.data.wards || []);
        } catch (error) {
            console.error("Lỗi khi tải Phường/Xã:", error);
        }
    }, []);

    // --- TẢI THÔNG TIN VÀ KHỞI TẠO ĐỊA CHỈ (Đã sửa) ---
    useEffect(() => {
        if (localStorage.getItem("role") !== 'DeliveryUnit') {
            navigate('/');
            return;
        }

        const fetchProvinces = async () => {
            try {
                const res = await axios.get(`${API_HOST}?depth=1`);
                setProvinces(res.data);
            } catch (error) {
                console.error("Lỗi khi tải Tỉnh/Thành phố:", error);
            }
        };

        const fetchInfoAndInitAddress = async () => {
            if (!deliveryUnitId) {
                setMessage("❌ Không tìm thấy ID đơn vị vận chuyển.");
                setLoading(false);
                return;
            }
            
            try {
                const res = await axios.get(`${apiUrl}/${deliveryUnitId}`);
                const data = res.data;
                
                // 1. Lưu thông tin cơ bản
                setInfo({
                    id: data.id || "",
                    deliveryUnitId: data.deliveryUnitId || "",
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    branchAddress: data.branchAddress || ""
                });

                // 2. Tách địa chỉ chi tiết để khởi tạo state
                const fullAddress = data.branchAddress || '';
                // Giả định địa chỉ luôn kết thúc bằng [Xã, Huyện, Tỉnh]
                const parts = fullAddress.split(',').map(p => p.trim()).filter(p => p);
                
                let detail = fullAddress;
                if (parts.length > 3) {
                    // Nếu có nhiều hơn 3 phần (Tỉnh, Huyện, Xã), phần còn lại là chi tiết
                    detail = parts.slice(0, parts.length - 3).join(', ');
                } else if (parts.length <= 3) {
                    // Nếu chỉ có 3 phần hoặc ít hơn, ta tạm coi chi tiết là toàn bộ chuỗi ban đầu
                    // Người dùng cần nhập lại nếu địa chỉ ban đầu không đầy đủ
                    detail = fullAddress; 
                }

                setDetailAddress(detail);

            } catch (error) {
                console.error("Lỗi khi lấy thông tin:", error);
                setMessage("❌ Không thể tải thông tin đơn vị vận chuyển. Vui lòng kiểm tra Back-end (cổng 8084).");
            } finally {
                setLoading(false);
            }
        };

        fetchProvinces();
        fetchInfoAndInitAddress();
    }, [deliveryUnitId, navigate]);
    
    // --- XỬ LÝ THAY ĐỔI ĐỊA LÝ (Giữ nguyên) ---
    const handleCityChange = (e) => {
        const code = e.target.value;
        setSelectedCityCode(code);
        setSelectedDistrictCode("");
        setSelectedWardCode("");
        setWards([]);
        fetchDistricts(code);
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        setSelectedDistrictCode(code);
        setSelectedWardCode("");
        fetchWards(code);
    };

    const handleWardChange = (e) => {
        setSelectedWardCode(e.target.value);
    };


    // --- Cập nhật thông tin đơn vị (Đã sửa) ---
    const handleUpdate = async () => {
        setUpdating(true);
        setMessage("");
        
        // 1. Lấy tên địa lý từ code
        const city = provinces.find(p => p.code === Number(selectedCityCode));
        const district = districts.find(d => d.code === Number(selectedDistrictCode));
        const ward = wards.find(w => w.code === Number(selectedWardCode));
        
        const trimmedDetailAddress = detailAddress.trim(); // Lấy địa chỉ chi tiết từ state riêng

        let newBranchAddress = info.branchAddress; // Mặc định giữ nguyên địa chỉ cũ

        if (selectedCityCode || selectedDistrictCode || selectedWardCode) {
            // Nếu người dùng có chọn địa chỉ mới (dù chỉ 1 cấp)
            if (ward && district && city && trimmedDetailAddress) {
                 // Nếu chọn đầy đủ 3 cấp và có địa chỉ chi tiết
                newBranchAddress = `${trimmedDetailAddress}, ${ward.name}, ${district.name}, ${city.name}`;
            } else {
                 // Nếu có chọn nhưng thiếu 1 trong 3 cấp hoặc thiếu địa chỉ chi tiết
                 setMessage("❌ Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã và nhập Địa chỉ chi tiết.");
                 setUpdating(false);
                 return;
            }
        } else if (!trimmedDetailAddress && info.branchAddress) {
             // Nếu người dùng xóa hết địa chỉ chi tiết cũ và không chọn địa chỉ mới
             setMessage("❌ Vui lòng nhập Địa chỉ chi tiết.");
             setUpdating(false);
             return;
        } else if (trimmedDetailAddress !== detailAddress) {
             // Trường hợp người dùng chỉ sửa địa chỉ chi tiết mà không chọn Tỉnh/Huyện/Xã mới
             // Ta cần tái tạo lại chuỗi địa chỉ đầy đủ (Phần Tỉnh/Huyện/Xã vẫn là cũ)
             const parts = info.branchAddress.split(',').map(p => p.trim()).filter(p => p);
             const geographicParts = parts.length >= 3 ? parts.slice(-3).join(', ') : '';
             
             if (geographicParts) {
                 newBranchAddress = `${trimmedDetailAddress}, ${geographicParts}`;
             } else {
                 newBranchAddress = trimmedDetailAddress; // Chỉ còn địa chỉ chi tiết
             }
        }
        
        try {
            const updatedData = {
                ...info,
                id: info.id,
                deliveryUnitId: info.deliveryUnitId,
                email: info.email,
                branchAddress: newBranchAddress // Gán địa chỉ mới
            };

            await axios.put(`${apiUrl}/${deliveryUnitId}/update`, updatedData);
            setInfo(prev => ({ ...prev, branchAddress: newBranchAddress })); 
            setDetailAddress(trimmedDetailAddress); // Cập nhật lại state chi tiết
            setMessage("✅ Cập nhật thông tin thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            setMessage("❌ Lỗi khi cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center mt-20"><CircularProgress /></div>;
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            
            <DeliveryUnitHeader
                userId={deliveryUnitId}
                anchorEl={anchorEl}
                handleMenuOpen={handleMenuOpen}
                handleMenuClose={handleMenuClose}
                handleGoToInfo={handleGoToDashboard}
                handleLogout={handleLogout}
            />

            <div className="flex-1 flex justify-center py-10 px-4">
                <div className="max-w-lg w-full">
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start', width: '100%', maxWidth: '512px', mx: 'auto' }}>
                        <Button 
                            variant="outlined" 
                            onClick={handleGoBack} 
                            startIcon={<ArrowBackIcon />}
                            color="inherit"
                        >
                            Quay lại Dashboard
                        </Button>
                    </Box>

                    <Card className="shadow-lg">
                        <CardContent>
                            <Typography variant="h5" className="text-center mb-6 font-semibold text-indigo-700">
                                Quản lý thông tin Đơn vị vận chuyển
                            </Typography>

                            <div className="space-y-4">
                                {/* Các trường thông tin cơ bản (Giữ nguyên) */}
                                <TextField
                                    fullWidth label="Tên đơn vị"
                                    value={info.name}
                                    onChange={(e) => setInfo({ ...info, name: e.target.value })}
                                />
                                <TextField
                                    fullWidth label="Email"
                                    value={info.email}
                                    InputProps={{ readOnly: true }}
                                    helperText="Không thể thay đổi email đăng ký"
                                />
                                <TextField
                                    fullWidth label="Số điện thoại"
                                    value={info.phone}
                                    onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                                />
                                
                                {/* ----------------------- KHU VỰC CHỌN ĐỊA CHỈ (ĐÃ SỬA) ----------------------- */}
                                <Typography variant="subtitle1" className="pt-2">
                                    Địa chỉ chi nhánh:
                                </Typography>
                                
                                {/* Dùng state detailAddress mới */}
                                <TextField
                                    fullWidth
                                    label="Địa chỉ chi tiết (VD: Số nhà, Tên đường)"
                                    value={detailAddress} 
                                    onChange={(e) => setDetailAddress(e.target.value)}
                                    required
                                />

                                {/* Chọn Tỉnh/Thành phố */}
                                <FormControl fullWidth required>
                                    <InputLabel>Tỉnh/Thành phố</InputLabel>
                                    <Select label="Tỉnh/Thành phố" value={selectedCityCode} onChange={handleCityChange}>
                                        <MenuItem value="">-- Chọn Tỉnh/Thành phố --</MenuItem>
                                        {provinces.map((p) => (<MenuItem key={p.code} value={p.code}>{p.name}</MenuItem>))}
                                    </Select>
                                </FormControl>
                                
                                {/* Chọn Quận/Huyện */}
                                <FormControl fullWidth required disabled={!selectedCityCode}>
                                    <InputLabel>Quận/Huyện</InputLabel>
                                    <Select label="Quận/Huyện" value={selectedDistrictCode} onChange={handleDistrictChange}>
                                        <MenuItem value="">-- Chọn Quận/Huyện --</MenuItem>
                                        {districts.map((d) => (<MenuItem key={d.code} value={d.code}>{d.name}</MenuItem>))}
                                    </Select>
                                </FormControl>
                                
                                {/* Chọn Phường/Xã */}
                                <FormControl fullWidth required disabled={!selectedDistrictCode}>
                                    <InputLabel>Phường/Xã</InputLabel>
                                    <Select label="Phường/Xã" value={selectedWardCode} onChange={handleWardChange}>
                                        <MenuItem value="">-- Chọn Phường/Xã --</MenuItem>
                                        {wards.map((w) => (<MenuItem key={w.code} value={w.code}>{w.name}</MenuItem>))}
                                    </Select>
                                </FormControl>

                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                    Địa chỉ hiện tại: {info.branchAddress} 
                                    { (selectedCityCode || selectedDistrictCode || selectedWardCode) && (
                                         <span className="text-red-600 font-semibold block"> (Địa chỉ mới sẽ là Địa chỉ chi tiết đã nhập + khu vực đã chọn)</span>
                                    )}
                                </Typography>
                                {/* -------------------------------------------------------------------- */}

                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleUpdate}
                                    disabled={updating}
                                    sx={{
                                        mt: 2, backgroundColor: "#4f46e5",
                                        "&:hover": { backgroundColor: "#4338ca" }
                                    }}
                                >
                                    {updating ? (
                                        <>
                                            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        "Cập nhật thông tin"
                                    )}
                                </Button>

                                {message && <p className="text-center text-sm mt-3 text-gray-700">{message}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DeliveryUnitInfo;