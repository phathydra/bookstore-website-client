import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from '../pages/home/home';
import Products from '../pages/products/products';
import Cart from '../pages/cart/cart';
import OrderHistory from '../pages/orderHistory/orderHistory';
import Profile from '../pages/profile/profile';
import BookDetail from '../pages/bookdetail/bookdetail';
import OrderDetail from '../pages/orderdetail/orderdetail';
import Header from '../components/header/header';
import Footer from "../components/footer/footer";
import Login from '../pages/Account/Login';
import Signup from '../pages/Account/Signup';
import ForgotPassword from '../pages/Account/ForgotPassword';

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/signup' element={<Signup />} />
                    <Route path='/forgot-password' element={<ForgotPassword />} />
                    <Route path='/' element={<Home />} />
                    <Route path='/products' element={<Products />} />
                    <Route path="/productdetail/:id" element={<BookDetail />} />
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/orderhistory' element={<OrderHistory />} />
                    <Route path='/orderdetail' element={<OrderDetail />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
