import React, { useState, useEffect } from "react";
import Categories from "../../components/categories/categories";
import Book from "../../components/book/book";
import axios from "axios"
import { useLocation } from "react-router-dom";
import "./products.css";

const Products = () => {
    const [books, setBooks] = useState([])
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(4)
    const [pagesArr, setPagesArr] = useState([])
    const location = useLocation();
    const searchParam = new URLSearchParams(location.search);

    useEffect(() =>{
        fetchBooks()
    }, [page, size, searchParam])

    const fetchBooks = async() =>{
        try {
            const response = searchParam === ""?
                await axios.get("http://localhost:8081/api/book", {
                    params: { page, size }
                }) :
                await axios.post("http://localhost:8081/api/book/search", {}, {
                    params: { page, size, input: searchParam.get("searchParam") }
                });
            console.log(response.data)
            setBooks(response.data);
            if(page === 0){
                if(response.data.totalPages === 1){
                    setPagesArr([0])
                }
                else {
                    setPagesArr([0, 1])
                }
            }
            else if(page === response.data.totalPages - 1){
                setPagesArr([page - 1, page])
            }
            else{
                setPagesArr([page - 1, page, page + 1])
            }
        } catch(e) {
            console.error("Lỗi khi lấy danh sách sách:", e);
        }
    }

    const handlePrevPage = () => {
        setPage(page - 1)
    }

    const handleNextPage = () => {
        setPage(page + 1)
    }

    const handleChangePage = (number) => {
        setPage(number)
    }
    
    return(
        <>
            <div className="products-page-container">
                <div className="categories-container">
                    <Categories/>
                </div>
                <div className="products-container">
                    <div className="products">
                        {(books?.content || []).map((book, index) => (
                            <Book book={book} key = {index}/>
                        ))}
                    </div>
                    <div className="page" style={books.totalPages === 0 ? { display: "none" } : {}}                    >
                        <button disabled = {books.first} onClick = {handlePrevPage}> &lt; </button>
                        {pagesArr.map((number, index) => (
                            <button key={index} onClick={() => handleChangePage(number)} disabled={number === books.number}> {number + 1} </button>
                        ))}
                        <button disabled = {books.last} onClick = {handleNextPage}> &gt; </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Products;