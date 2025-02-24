import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from '../pages/home/home'
import Products from '../pages/products/products'
import Cart from '../pages/cart/cart'
import OrderHistory from '../pages/orderHistory/orderHistory'
import Profile from '../pages/profile/profile'
import BookDetail from '../pages/bookdetail/bookdetail'
import OrderDetail from '../pages/orderdetail/orderdetail'
import Header from '../components/header/header'
import Footer from "../components/footer/footer";

const App = () => {

    return (
        <BrowserRouter>
            <Header/>
                <Routes>
                    <Route path='/' element={<Home />}></Route>
                    <Route path='/products' element={<Products />}></Route>
                    <Route path='/productdetail' element={<BookDetail />}></Route>
                    <Route path='/profile' element={<Profile />}></Route>
                    <Route path='/cart' element={<Cart />}></Route>
                    <Route path='/orderhistory' element={<OrderHistory />}></Route>
                    <Route path='/orderdetail' element={<OrderDetail />}></Route>
                </Routes>
            <Footer/>
        </BrowserRouter>
    )
}

export default App;