import React, { useState } from "react";
import axios from "axios";

const CartItem = ({ item, accountId, onUpdate, onRemove }) => {
    const [quantity, setQuantity] = useState(item.quantity || 1);

    const updateQuantity = async (newQuantity) => {
        if (newQuantity <= 0) return;
        try {
            await axios.put(`http://localhost:8082/cart/update/${accountId}/${item.bookId}`, null, {
                params: { quantity: newQuantity }
            });
            setQuantity(newQuantity);
            onUpdate(item.bookId, newQuantity);
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng", error);
        }
    };

    const removeItem = async () => {
        try {
            await axios.delete(`http://localhost:8082/cart/remove/${accountId}/${item.bookId}`);
            onRemove(item.bookId);
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm", error);
        }
    };

    return (
        <div className="flex items-center p-6 border-b border-gray-200 bg-white transition-colors duration-300 w-full">
            <img src={item.bookImage} alt={item.bookName} className="w-24 h-32 object-cover mr-6" />
            <div className="flex-1">
                <p className="text-xl font-bold my-2">{item.bookName}</p>
                <p className="text-lg text-blue-600 my-2">{Number(item.price || 1).toLocaleString("vi-VN")} VND</p>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => updateQuantity(quantity - 1)}
                        className="px-3 py-2 border border-gray-300 bg-red-300 cursor-pointer text-lg rounded-md hover:bg-red-500 mx-2"
                    >
                        -
                    </button>
                    <span className="text-lg">{quantity}</span>
                    <button
                        onClick={() => updateQuantity(quantity + 1)}
                        className="px-3 py-2 border border-gray-300 bg-green-300 cursor-pointer text-lg rounded-md hover:bg-green-500 mx-2"
                    >
                        +
                    </button>
                    <button
                        className="px-4 py-2 flex items-center gap-2 bg-red-500 text-white text-lg font-semibold rounded-lg shadow-md 
                                hover:bg-red-600 hover:scale-105 active:bg-red-700 active:scale-95 transition-all duration-300"
                        onClick={removeItem}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 4v6m4-6v6M10 2h4a1 1 0 0 1 1 1v1H9V3a1 1 0 0 1 1-1z"></path>
                        </svg>
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;