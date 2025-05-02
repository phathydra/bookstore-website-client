import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Account/Login";
import ForgotPassword from "./pages/Account/ForgotPassword";
import BookManagement from "./pages/BookManagement/BookManagement";
import AccoutManagement from "./pages/AccoutManagement/AccoutManagement";
import OrderManagement from "./pages/InvoiceManagement/InvoiceManagement";
import InformationManagement from "./pages/InformationManagement/InformationManagement";
import SupplierManagement from "./pages/SupplierManagement/SupplierManagement";
import Profile from "./pages/Profile/Profile";
import Password from "./pages/Profile/Password";
import DiscountManagement from "./pages/DiscountManagement/DiscountManagement";
import VoucherManagement from "./pages/VoucherManagement/VoucherManagement";

const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("accountId");

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    return isLoggedIn ? children : null;
};

function App() {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("accountId");

    useEffect(() => {
        if (isLoggedIn && window.location.pathname === "/") {
            navigate("/book-management");
        } else if (!isLoggedIn && window.location.pathname !== "/login" && window.location.pathname !== "/signup" && window.location.pathname !== "/forgot-password") {
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    return (
        <div className="h-screen w-screen">
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/book-management" element={<PrivateRoute><BookManagement /></PrivateRoute>} />
                <Route path="/account-management" element={<PrivateRoute><AccoutManagement /></PrivateRoute>} />
                <Route path="/information-management" element={<PrivateRoute><InformationManagement /></PrivateRoute>} />
                <Route path="/invoice-management" element={<PrivateRoute><OrderManagement /></PrivateRoute>} />
                <Route path="/supplier-management" element={<PrivateRoute><SupplierManagement /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/change-password" element={<PrivateRoute><Password /></PrivateRoute>} />
                <Route path="/discount-management" element={<PrivateRoute><DiscountManagement /></PrivateRoute>} />
                <Route path="/voucher-management" element={<PrivateRoute><VoucherManagement /></PrivateRoute>} />
            </Routes>
        </div>
    );
}

function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default AppWrapper;