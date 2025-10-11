import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Cập nhật đường dẫn: Đã sửa lỗi "Could not resolve" bằng cách giả định các file 
// Login và Dashboard nằm ở cấp độ thư mục hiện tại (cùng với App.jsx)
import DeliveryUnitLogin from './pages/AuthenticationPages/Login'; 
import DeliveryUnitDashboard from  './pages/Homepage/Homepage';
import HomeShipper from  './pages/Shipper/ShipperDashboard';  
import MapView from './pages/Map/MapView';
import DeliveryUnitInfo from './pages/DeliveryUnitInfo/DeliveryUnitInfo';
import ShipperInfo from './pages/ShipperInfo/ShipperInfo';

// --- Components Placeholder (Chỉ để giữ chỗ cho các trang khác) ---

const ForgotPassword = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="p-10 bg-white rounded-xl shadow-lg text-center">
      <h2 className="text-3xl font-bold text-gray-700 mb-4">Quên Mật Khẩu</h2>
      <p className="text-gray-600">Chức năng này sẽ được phát triển sau.</p>
    </div>
  </div>
);

// --- Ứng dụng chính (App) ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login mặc định */}
        <Route path="/" element={<DeliveryUnitLogin />} />

        {/* Dashboard cho DeliveryUnit */}
        <Route path="/delivery-orders" element={<DeliveryUnitDashboard />} />
        <Route path="/DeliveryUnitInfo" element={<DeliveryUnitInfo />} />

        {/* Dashboard cho Shipper */}
        <Route path="/shipper-dashboard" element={<HomeShipper />} />
        <Route path="/shipper-info" element={<ShipperInfo />} />
        <Route path="/map-view" element={<MapView />} />

        {/* Forgot password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-4xl text-red-600 font-extrabold">404 | Không tìm thấy trang</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
