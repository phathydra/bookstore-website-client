import React, { useState } from "react";
import axios from "axios";

const CartItem = ({ item, accountId, onUpdate, onRemove }) => {
    const [quantity, setQuantity] = useState(item.quantity || 299);

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
        <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50 transition-colors duration-300 w-full">
            <img src={item.bookImage} alt={item.bookName} className="w-20 h-28 object-cover mr-5" />
            <div className="flex-1">
                <p className="text-lg font-bold my-1">{item.bookName}</p>
                <p className="text-base text-blue-600 my-1">{Number(item.price || 1).toLocaleString("vi-VN")} VND</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateQuantity(quantity - 1)}
                        className="px-2 py-1 border border-gray-300 bg-white cursor-pointer text-base rounded-md hover:bg-gray-100 mx-2"
                    >
                        -
                    </button>
                    <span className="text-base">{quantity}</span>
                    <button
                        onClick={() => updateQuantity(quantity + 1)}
                        className="px-2 py-1 border border-gray-300 bg-white cursor-pointer text-base rounded-md hover:bg-gray-100 mx-2"
                    >
                        +
                    </button>
                    <button
                        className="px-4 py-1 bg-red-500 text-white text-base rounded-full cursor-pointer hover:bg-red-600 hover:scale-105 active:bg-red-700 active:scale-95 transition-all duration-200"
                        onClick={removeItem}
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;