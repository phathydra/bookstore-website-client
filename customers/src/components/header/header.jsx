"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FaSearch, FaShoppingCart } from "react-icons/fa"
import logo from "../../assets/logo.png"
import GUEST from "../../assets/GUEST.jpg"
import { useDebounce } from "./hooks/useDebounce"
import { trackSearch } from "../../pages/bookdetail/services/bookService"

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
    <header className="h-16 flex items-center justify-between px-5 bg-cyan-100 shadow-md relative">
      <div className="flex items-center space-x-6">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo || "/placeholder.svg"} alt="Logo" className="w-24" />
        </div>
        <nav className="flex gap-5">
          <button className="text-gray-700 hover:text-blue-500" onClick={() => navigate("/")}>
            Trang chủ
          </button>
          <button className="text-gray-700 hover:text-blue-500" onClick={() => navigate("/products?searchParam=")}>
            Sản phẩm
          </button>
          <button className="text-gray-700 hover:text-blue-500" onClick={() => navigate("/category/someCategory")}>
            Danh mục
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-x-6 pr-10">
        <div className="relative flex items-center w-full max-w-lg" ref={searchResultsRef}>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={input}
            className="px-6 py-3 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-100 w-500 h-12"
          />
          <button
            onClick={handleSearch}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
          >
            <FaSearch />
          </button>

          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-50">
              <ul>
                {searchResults.map(book => (
                  <li
                    key={book.bookId}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
                      className="w-10 h-14 object-cover rounded-md"
                    />
                    <span className="text-gray-800">
                      {book.bookName}
                      {book.bookAuthor && <span className="text-gray-600 ml-1">({book.bookAuthor})</span>}
                    </span>
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

        <button
          className="relative text-gray-700 hover:text-blue-500"
          onClick={() => navigate("/cart")}
        >
          <FaShoppingCart className="text-2xl" />
        </button>

        <div className="relative flex items-center gap-x-4" ref={menuRef}>
          {isLogin && <span className="text-gray-700 font-medium">{user.name}</span>}
          <img
            className="w-10 h-10 rounded-full cursor-pointer"
            src={isLogin ? user.avatar : GUEST}
            alt="Profile"
            onClick={toggleMenu}
          />
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-50">
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => navigate(localStorage.getItem("accountId") ? "/profile" : "/login")}
              >
                Trang cá nhân
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => navigate(localStorage.getItem("accountId") ? "/orderHistory" : "/login")}
              >
                Lịch sử mua hàng
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => navigate(localStorage.getItem("accountId") ? "/address" : "/login")}
              >
                Địa chỉ nhận hàng
              </button>
              <button
                className="block w-full px-4 py-2 text-left bg-red-500 text-white hover:bg-red-600"
                onClick={handleLogout}
              >
                {isLogin ? "Đăng xuất" : "Đăng nhập"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
