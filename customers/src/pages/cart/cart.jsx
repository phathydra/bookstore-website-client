import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CartItem from "../../components/cartItem/cartItem";
import "./cart.css"

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [address, setAddress] = useState(null);
    const navigate = useNavigate();

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
            const accountId = localStorage.getItem("accountId");
            if (!accountId) {
                console.error("Account not logged in!");
                setError("Vui lòng đăng nhập trước khi đặt hàng.");
                return;
            }

            try {
                const addressResponse = await axios.get(`http://localhost:8080/api/address?accountId=${accountId}`);
                const activeAddress = addressResponse.data.find(address => address.status === "ACTIVE");

                if (activeAddress) {
                    setAddress(prevAddress => ({
                        ...prevAddress,
                        phoneNumber: activeAddress.phoneNumber || "",
                        recipientName: activeAddress.recipientName || "",
                        city: activeAddress.city || "",
                        district: activeAddress.district || "",
                        ward: activeAddress.ward || "",
                        note: activeAddress.note || "",
                    }));
                } else {
                    console.error("No active address found for the logged-in account.");
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

        navigate("/orderdetail", {
            state: {
                selectedBooks,
                address,
                totalAmount
            }
        });
    };

    return (
        <div className="flex flex-col items-center p-5 max-w-2xl mx-auto">
            {loading ? (
                <p className="text-gray-500">Đang tải giỏ hàng...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : cartItems.length === 0 ? (
                <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
            ) : (
                cartItems.map((item) => (
                    <div key={item.bookId} className="flex items-center gap-4 p-4 border-b w-full">
                        <input
                            type="checkbox"
                            checked={selectedItems[item.bookId] || false}
                            onChange={() => toggleSelect(item.bookId)}
                        />
                        <CartItem
                            item={item}
                            accountId={accountId}
                            onUpdate={updateQuantity}
                            onRemove={removeItem}
                        />
                    </div>
                ))
            )}

            <div className="cart-total sticky bottom-0 w-full bg-green-100 p-4 rounded-t-lg flex flex-col items-center z-10">
                <h3 className="text-lg font-semibold">Total: {totalAmount.toLocaleString("en-US")} VND</h3>
                <button
                    className="mt-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={totalAmount === 0}
                    onClick={handleConfirmOrder}
                    >
                    {totalAmount === 0 ? "Select products to checkout" : "Confirm Order"}
                </button>
            </div>
        </div>
    );
};

export default Cart;