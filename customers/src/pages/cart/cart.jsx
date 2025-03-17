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

    const updateQuantity = useCallback((bookId, newQuantity) => {
        setCartItems(prevCart =>
            prevCart.map(item => item.bookId === bookId ? { ...item, quantity: newQuantity } : item)
        );
    }, []);

    const removeItem = useCallback((bookId) => {
        setCartItems(prevCart => prevCart.filter(item => item.bookId !== bookId));
        setSelectedItems(prevSelected => {
            const updatedSelection = { ...prevSelected };
            delete updatedSelection[bookId];
            return updatedSelection;
        });
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
        <div className="flex flex-col items-center p-5 max-w-4xl mx-auto">
            {loading ? (
                <p className="text-gray-500">Đang tải giỏ hàng...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : cartItems.length === 0 ? (
                <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
            ) : (
                <div className="w-full">
                    <div className="space-y-6">
                        {/* "Select All" Checkbox */}
                        <div className="flex items-center gap-4 p-4 w-full">
                            <input
                                type="checkbox"
                                ref={selectAllRef}
                                checked={allSelected}
                                onChange={handleSelectAll}
                                className="w-5 h-5"
                            />
                            <label className="text-lg font-semibold">Select All</label>
                        </div>
                        
                        {/* Cart Items List */}
                        {cartItems.map((item) => (
                            <div key={item.bookId} className="flex items-center gap-4 p-6 border-b w-full bg-white shadow-md rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={selectedItems[item.bookId] || false}
                                    onChange={() => toggleSelect(item.bookId)}
                                    className="w-5 h-5"
                                />
                                <CartItem
                                    item={item}
                                    accountId={accountId}
                                    onUpdate={updateQuantity}
                                    onRemove={removeItem}
                                />
                            </div>
                        ))}
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