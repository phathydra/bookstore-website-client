import React from "react";
import data from "../../data.jsx";
import Slider from "../../components/slider/slider.jsx";
import Product from "../../components/product/product.jsx";
import "./home.css"

const Home = () => {

    return (
        <>
            <Slider/>
            <div className="home-container">
                {data.products.map((product, index) => (
                    <Product product={product} key = {index}/>
                ))}
            </div>
        </>
    );
}

export default Home;