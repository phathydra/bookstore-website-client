import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Account/Login";
import Signup from "./pages/Account/Signup";
import ForgotPassword from "./pages/Account/ForgotPassword";
import BookManagement from "./pages/BookManagement/BookManagement";
import AccoutManagement from "./pages/AccoutManagement/AccoutManagement";
import OrderManagement from "./pages/InvoiceManagement/InvoiceManagement";
import InformationManagement from "./pages/InformationManagement/InformationManagement";
import SupplierManagement from "./pages/SupplierManagement/SupplierManagement";
import Profile from "./pages/Profile/Profile";
import Address from "./pages/Profile/Address";
import Password from "./pages/Profile/Password";
import Order from "./pages/Profile/Order";


function App() {
  return (
    <Router>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/book-management" element={<BookManagement />} />
          <Route path="/account-management" element={<AccoutManagement />} />
          <Route path="/information-management" element={<InformationManagement />} />
          <Route path="/invoice-management" element={<OrderManagement />} />
          <Route path="/supplier-management" element={<SupplierManagement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/address" element={<Address />} />
          <Route path="/change-password" element={<Password />} />
          <Route path="/purchase-order" element={<Order />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
