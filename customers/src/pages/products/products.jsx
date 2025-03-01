import React from "react";
import Categories from "../../components/categories/categories";
import Product from "../../components/book/book";
import data from "../../data.jsx";
import "./products.css";

const Products = () => {
    
    return(
        <>
            <div className="container">
                <div className="categories-container">
                    <Categories/>
                </div>
                <div className="products-container">
                    <div className="products">
                        {data.products.map((product, index) => (
                            <Product product={product} key = {index}/>
                        ))}
                    </div>
                    <div className="page">
                        <button> &lt; </button>
                        <button> 1 </button>
                        <button> 2 </button>
                        <button> &gt; </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Products;