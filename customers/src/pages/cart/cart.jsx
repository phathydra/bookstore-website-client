import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CartItem from "../../components/cartItem/cartItem";
import "./cart.css";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [address, setAddress] = useState(null);  // Lưu thông tin địa chỉ
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
            const accountId = localStorage.getItem("accountId");  // Lấy accountId từ localStorage
        
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
    
        // Navigate to order detail page with selected items and address
        navigate("/orderdetail", {
            state: {
                selectedBooks,
                address,
                totalAmount
            }
        });
    };

    return (
        <div className="cart">
            {loading ? (
                <p>Đang tải giỏ hàng...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : cartItems.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
                cartItems.map((item) => (
                    <div key={item.bookId} className="cart-item">
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

            <div className="total-section">
                <h3>Total: {totalAmount.toLocaleString("vi-VN")} VND</h3>
                <button className="confirm-button" disabled={totalAmount === 0} onClick={handleConfirmOrder}>
                    {totalAmount === 0 ? "Chọn sản phẩm để thanh toán" : "Xác nhận đơn hàng"}
                </button>
            </div>
        </div>
    );
};

export default Cart;
