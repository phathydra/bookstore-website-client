import React, { useState } from "react";
import axios from "axios";

const CartItem = ({ item, accountId, onUpdate, onRemove }) => {

    return (
        <div className="flex items-center p-6 border-b border-gray-200 bg-white transition-colors duration-300 w-full">
            <img src={item.bookImage} alt={item.bookName} className="w-24 h-32 object-cover mr-6" />
            <div className="flex-1">
                <p className="text-xl font-bold my-2">{item.bookName}</p>
                <p className="text-lg text-blue-600 my-2">{Number(item.price || 1).toLocaleString("vi-VN")} VND</p>
            </div>
        </div>
    );
};

export default CartItem;