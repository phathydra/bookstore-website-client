import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/home/home";
import Products from "../pages/products/products";
import Cart from "../pages/cart/cart";
import OrderHistory from "../pages/orderHistory/orderHistory";
import Profile from "../pages/profile/profile";
import BookDetail from "../pages/bookdetail/bookdetail";
import OrderDetail from "../pages/orderdetail/orderdetail";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import Login from "../pages/Account/Login";
import Signup from "../pages/Account/Signup";
import ForgotPassword from "../pages/Account/ForgotPassword";
import AddressPage from "../pages/address/AddressPage";
import CategoryPage from "../pages/CategoryPage/CategoryPage";
import AddressSelectionPage from "../components/AddressSelectionPage/AddressSelectionPage";
import ChatScreen from "../pages/chatbot/tempchatbot";

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
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/productdetail/:id" element={<BookDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orderhistory" element={<OrderHistory />} />
          <Route path="/orderdetail" element={<OrderDetail />} />
          <Route path="/address" element={<AddressPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/addressselection" element={<AddressSelectionPage />} />
          <Route path="/chatbot" element={<ChatScreen />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
