import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CartItem from "../../components/cartItem/cartItem";
import "./cart.css";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [address, setAddress] = useState(null);
    const navigate = useNavigate();
    const selectAllRef = useRef(null);

    const accountId = localStorage.getItem("accountId");

    useEffect(() => {
        if (!accountId) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem giỏ hàng.");
            return;
        }

        const fetchCart = async () => {
            try {
                const response = await axios.get(`http://localhost:8082/cart/${accountId}`);
                const items = response.data.cartItems || [];
                setCartItems(items);
                setSelectedItems(items.reduce((acc, item) => ({ ...acc, [item.bookId]: false }), {}));
            } catch (error) {
                console.error("Lỗi khi tải giỏ hàng", error);
                setError("Không thể tải giỏ hàng, vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        const fetchAddress = async () => {
            try {
                const addressResponse = await axios.get(`http://localhost:8080/api/address?accountId=${accountId}`);
                const activeAddress = addressResponse.data.find(address => address.status === "ACTIVE");
                if (activeAddress) {
                    setAddress({
                        phoneNumber: activeAddress.phoneNumber || "",
                        recipientName: activeAddress.recipientName || "",
                        city: activeAddress.city || "",
                        district: activeAddress.district || "",
                        ward: activeAddress.ward || "",
                        note: activeAddress.note || "",
                    });
                } else {
                    setError("Không tìm thấy địa chỉ hoạt động cho tài khoản này.");
                }
            } catch (error) {
                console.error("Lỗi khi tải địa chỉ", error);
                setError("Không thể tải địa chỉ, vui lòng thử lại sau.");
            }
        };

        fetchCart();
        fetchAddress();
    }, [accountId]);

    const updateQuantity = useCallback( async (bookId, newQuantity) => {
        if (newQuantity <= 0) return;
        try {
            await axios.put(`http://localhost:8082/cart/update/${accountId}/${bookId}`, null, {
                params: { quantity: newQuantity }
            });
            setCartItems(prevCart =>
                prevCart.map(item => item.bookId === bookId ? { ...item, quantity: newQuantity } : item)
            );
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng", error);
        }
    }, []);

    const removeItem = useCallback(async (bookId) => {
        try {
            await axios.delete(`http://localhost:8082/cart/remove/${accountId}/${bookId}`);
            setCartItems(prevCart => prevCart.filter(item => item.bookId !== bookId));
            setSelectedItems(prevSelected => {
                const updatedSelection = { ...prevSelected };
                delete updatedSelection[bookId];
                return updatedSelection;
            });
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm", error);
        }
    }, []);

    const toggleSelect = (bookId) => {
        setSelectedItems(prevSelected => ({
            ...prevSelected,
            [bookId]: !prevSelected[bookId]
        }));
    };

    const allSelected = useMemo(() => {
        return cartItems.length > 0 && cartItems.every(item => selectedItems[item.bookId]);
    }, [cartItems, selectedItems]);

    const someSelected = useMemo(() => {
        return cartItems.some(item => selectedItems[item.bookId]);
    }, [cartItems, selectedItems]);

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        const newSelectedItems = {};
        cartItems.forEach(item => {
            newSelectedItems[item.bookId] = isChecked;
        });
        setSelectedItems(newSelectedItems);
    };

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = someSelected && !allSelected;
        }
    }, [someSelected, allSelected]);

    const totalAmount = cartItems.reduce((sum, item) =>
        selectedItems[item.bookId] ? sum + item.price * item.quantity : sum, 0
    );

    const handleConfirmOrder = async () => {
        const selectedBooks = cartItems.filter(item => selectedItems[item.bookId]);
        if (selectedBooks.length === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
            return;
        }
        if (!address) {
            alert("Vui lòng cập nhật địa chỉ giao hàng.");
            return;
        }
        navigate("/orderdetail", { state: { selectedBooks, address, totalAmount } });
    };

    return (
        <div className="flex flex-col items-center p-5 w-[90%] mx-auto">
            {loading ? (
                <p className="text-gray-500">Đang tải giỏ hàng...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : cartItems.length === 0 ? (
                <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
            ) : (
                <div className="w-full">
                    <div className="space-y-6">
                        {/* Cart Items List */}
                        <table className="w-full bg-white shadow-md rounded-lg">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-4 text-left">
                                            <input
                                                type="checkbox"
                                                ref={selectAllRef}
                                                checked={allSelected}
                                                onChange={handleSelectAll}
                                                className="w-5 h-5"
                                            />
                                    </th>
                                    <th className="p-4 text-left">Book</th>
                                    <th className="p-4 text-left">Quantity</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.bookId} className="border-b">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems[item.bookId] || false}
                                                onChange={() => toggleSelect(item.bookId)}
                                                className="w-5 h-5"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <CartItem item={item} accountId={accountId} />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                                                    className="w-10 h-10 border border-gray-300 cursor-pointer text-lg rounded-md hover:bg-red-500"
                                                >
                                                    -
                                                </button>
                                                <span className="w-10 h-10 text-lg w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                                                    className="w-10 h-10 border border-gray-300 cursor-pointer text-lg rounded-md hover:bg-green-500"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                className="px-4 py-2 flex items-center gap-2 bg-red-500 text-white text-lg font-semibold rounded-lg shadow-md 
                                                        hover:bg-red-600 hover:scale-105 active:bg-red-700 active:scale-95 transition-all duration-300"
                                                onClick={() => removeItem(item.bookId)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 4v6m4-6v6M10 2h4a1 1 0 0 1 1 1v1H9V3a1 1 0 0 1 1-1z"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Cart Total Section */}
            <div className="cart-total sticky bottom-0 w-full bg-green-100 p-4 rounded-t-lg flex flex-col items-center z-10">
                <h3 className="text-xl font-bold">Total: {totalAmount.toLocaleString("en-US")} VND</h3>
                <button
                    className="mt-4 bg-green-600 text-white py-3 px-6 rounded-full shadow-lg 
                            hover:scale-105 hover:bg-green-700 transition-all duration-300 
                            disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold w-65 text-center"
                    disabled={totalAmount === 0}
                    onClick={handleConfirmOrder}
                >
                    {totalAmount === 0 ? "Chọn sản phẩm để thanh toán" : "Xác nhận đặt hàng"}
                </button>
            </div>
        </div>
    );
};

export default Cart;