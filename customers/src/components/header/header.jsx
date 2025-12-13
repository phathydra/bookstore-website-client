"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FaSearch, FaShoppingCart, FaThLarge, FaChevronDown } from "react-icons/fa"
import logo from "../../assets/logo.png"
import GUEST from "../../assets/GUEST.jpg"
import { useDebounce } from "./hooks/useDebounce"
import { trackSearch } from "../../pages/bookdetail/services/bookService"
import SideNav from "../SideNav/SideNav"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState({ name: "", avatar: "" })
  const [input, setInput] = useState("")
  const [isLogin, setIsLogin] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSuggestionSelected, setIsSuggestionSelected] = useState(false)

  const menuRef = useRef(null)
  const searchResultsRef = useRef(null)
  const navigate = useNavigate()
  const debouncedInput = useDebounce(input, 500)

  useEffect(() => {
    const checkLoginStatus = () => {
      const accountId = localStorage.getItem("accountId")
      if (accountId) {
        fetch(`http://localhost:8080/api/account/fetch?accountId=${accountId}`)
          .then(res => res.json())
          .then(data => {
            setUser({
              name: data.name || "Username",
              avatar: data.avatar || "https://via.placeholder.com/40",
            })
            setIsLogin(true)
          })
          .catch(err => console.error("Error fetching user data:", err))
      } else {
        setIsLogin(false)
        setUser({ name: "", avatar: "" })
      }
    }

    checkLoginStatus()
    window.addEventListener("storage", checkLoginStatus)
    return () => {
      window.removeEventListener("storage", checkLoginStatus)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleChange = e => {
    setInput(e.target.value)
    setIsSuggestionSelected(false)
  }

  const fetchSearchResults = async searchTerm => {
    try {
      const response = await fetch(`http://localhost:8081/api/book/search?page=0&size=5`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `input=${encodeURIComponent(searchTerm)}`,
      })
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.content || [])
        setShowSearchResults(true)
      } else setSearchResults([])
    } catch (error) {
      console.error("Error fetching search results:", error)
      setSearchResults([])
    }
  }

  useEffect(() => {
    if (debouncedInput.trim() !== "") {
      fetchSearchResults(debouncedInput)
      const accountId = localStorage.getItem("accountId")
      trackSearch(debouncedInput, accountId).catch(() => {})
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [debouncedInput])

  const handleSearch = () => {
    if (isSuggestionSelected) {
      setIsSuggestionSelected(false)
      return
    }
    if (input.trim() !== "") navigate(`/products?searchParam=${encodeURIComponent(input)}`)
    else navigate(`/products`)
    setShowSearchResults(false)
  }

  const toggleMenu = () => setIsMenuOpen(prev => !prev)

  const handleClickOutside = event => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      searchResultsRef.current &&
      !searchResultsRef.current.contains(event.target)
    ) {
      setIsMenuOpen(false)
      setShowSearchResults(false)
    } else if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
      setShowSearchResults(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("accountId")
    setIsLogin(false)
    navigate("/login")
  }

  const handleKeyDown = event => {
    if (event.key === "Enter") {
      if (!isSuggestionSelected) handleSearch()
      else setIsSuggestionSelected(false)
    }
  }

  return (
    <header className="h-20 bg-white shadow-md relative z-40">
      <div className="container mx-auto h-full px-4 flex items-center justify-between gap-4">
        
        {/* 1. LOGO */}
        <div className="cursor-pointer flex-shrink-0" onClick={() => navigate("/")}>
          <img src={logo || "/placeholder.svg"} alt="Logo" className="w-24 md:w-32 object-contain" />
        </div>

        {/* 2. GROUP: DANH MỤC + NAVIGATION LINKS */}
        <div className="flex items-center gap-6">
            {/* Danh mục Dropdown */}
            <div className="relative group h-10 hidden md:block z-50">
                <button className="flex items-center gap-2 px-2 py-2 text-gray-700 hover:text-cyan-700 font-bold transition-colors h-full cursor-pointer">
                    <FaThLarge className="text-xl" />
                    <span className="text-sm lg:text-base">Danh mục</span>
                    <FaChevronDown className="text-xs mt-1 transition-transform group-hover:rotate-180"/>
                </button>

                <div className="absolute top-full left-0 pt-0 hidden group-hover:block transition-all duration-200 w-64">
                    <SideNav />
                </div>
            </div>

            {/* --- MỚI THÊM: CÁC NÚT ĐIỀU HƯỚNG (Trang chủ, Sản phẩm) --- */}
            <nav className="hidden xl:flex items-center gap-5 font-medium text-gray-600">
                <button 
                    onClick={() => navigate("/")} 
                    className="hover:text-cyan-700 transition-colors"
                >
                    Trang chủ
                </button>
                <button 
                    onClick={() => navigate("/products?searchParam=")} 
                    className="hover:text-cyan-700 transition-colors"
                >
                    Sản phẩm
                </button>
            </nav>
        </div>

        {/* 3. THANH TÌM KIẾM */}
        <div className="relative flex-grow max-w-lg mx-4" ref={searchResultsRef}>
          <div className="flex items-center border-2 border-cyan-700 rounded-lg overflow-hidden h-10 bg-white">
            <input
                type="text"
                placeholder="Tìm kiếm sách, tác giả..."
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                value={input}
                className="flex-grow px-4 py-2 outline-none text-gray-700 bg-transparent"
            />
            <button
                onClick={handleSearch}
                className="bg-cyan-700 text-white px-6 py-2 hover:bg-cyan-800 transition-colors h-full flex items-center justify-center"
            >
                <FaSearch />
            </button>
          </div>

          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-[60]">
              <ul>
                {searchResults.map(book => (
                  <li
                    key={book.bookId}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => {
                      setInput(book.bookName)
                      setShowSearchResults(false)
                      setIsSuggestionSelected(true)
                      navigate(`/productdetail/${book.bookId}`)
                    }}
                  >
                    <img
                      src={book.bookImage || "https://via.placeholder.com/40"}
                      alt={book.bookName}
                      className="w-10 h-14 object-cover rounded shadow-sm"
                    />
                    <div className="flex flex-col">
                        <span className="text-gray-800 font-medium text-sm line-clamp-1">{book.bookName}</span>
                        {book.bookAuthor && <span className="text-gray-500 text-xs">({book.bookAuthor})</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
            {showSearchResults && searchResults.length === 0 && input.trim() !== "" && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-50">
              <div className="px-4 py-2 text-gray-500">Không tìm thấy sách nào.</div>
            </div>
          )}
        </div>

        {/* 4. ICON GIỎ HÀNG & TÀI KHOẢN */}
        <div className="flex items-center gap-6 flex-shrink-0">
            <button
                className="relative text-gray-600 hover:text-cyan-700 transition-colors flex flex-col items-center justify-center"
                onClick={() => navigate("/cart")}
            >
                <FaShoppingCart className="text-2xl" />
                <span className="text-xs mt-1 hidden lg:block">Giỏ hàng</span>
            </button>

            <div className="relative flex items-center gap-2 cursor-pointer group" onClick={toggleMenu} ref={menuRef}>
                <img
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    src={isLogin ? user.avatar : GUEST}
                    alt="Profile"
                />
                <div className="hidden lg:flex flex-col">
                    <span className="text-xs text-gray-500">Tài khoản</span>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
                        {isLogin ? user.name : "Khách"}
                    </span>
                    <FaChevronDown className="text-xs ml-1 absolute right-[-15px] top-1/2 -translate-y-1/2 text-gray-400"/>
                </div>
                
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-gray-200 rounded-md shadow-xl z-50 py-2">
                        <button className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700" onClick={() => navigate(localStorage.getItem("accountId") ? "/profile" : "/login")}>
                            Trang cá nhân
                        </button>
                        <button className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700" onClick={() => navigate(localStorage.getItem("accountId") ? "/orderHistory" : "/login")}>
                            Lịch sử mua hàng
                        </button>
                        <button className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700" onClick={() => navigate(localStorage.getItem("accountId") ? "/address" : "/login")}>
                            Địa chỉ nhận hàng
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 text-sm" onClick={handleLogout}>
                            {isLogin ? "Đăng xuất" : "Đăng nhập"}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  )
}

export default Header