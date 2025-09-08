import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/home/home";
import Products from "../pages/products/ProductsPage";
import Cart from "../pages/cart/cart";
import OrderHistory from "../pages/orderHistory/orderHistory";
import Profile from "../pages/profile/profile";
import BookDetail from "../pages/bookdetail/components/bookdetail";
import OrderDetail from "../pages/orderdetail/orderdetail";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import Login from "../pages/Account/Login";
import Signup from "../pages/Account/Signup";
import ForgotPassword from "../pages/Account/ForgotPassword";
import AddressPage from "../pages/address/AddressPage";
import CategoryPage from "../pages/CategoryPage/CategoryPage";
import AddressSelectionPage from "../components/AddressSelectionPage/AddressSelectionPage";
import ActivateAccount from "../pages/Account/ActivateAccount"; 
import FillInfo from '../pages/Account/FillInfo';
import ChangePassword from "../pages/profile/changePassword";
import VouchersWallet from "../pages/profile/vouchersWallet";


const Layout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/activate" element={<ActivateAccount />} /> 
          <Route path="/fill-info" element={<FillInfo />} />
          <Route path="/" element={<Home />} />
          <Route path="/products/:categoryName" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/productdetail/:id" element={<BookDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orderhistory" element={<OrderHistory />} />
          <Route path="/orderdetail" element={<OrderDetail />} />
          <Route path="/address" element={<AddressPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/addressselection" element={<AddressSelectionPage />} />
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/vouchersWallet" element={<VouchersWallet />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;