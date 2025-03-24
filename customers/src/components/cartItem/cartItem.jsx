import React from "react";
import { Link } from "react-router-dom";

const CartItem = ({ item, accountId, onUpdate, onRemove }) => {
    return (
        <Link
            to={`/productdetail/${item.bookId}`}
            className="w-full"
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            <div className="flex items-center p-6 bg-white transition-colors duration-300 gap-6">
                <img src={item.bookImage} alt={item.bookName} className="w-12 h-16 object-cover mr-6" />
                <div className="flex-1">
                    <p className="text-xl my-2">{item.bookName}</p>
                    <p className="text-lg text-blue-600 my-2">{Number(item.price || 1).toLocaleString("vi-VN")} VND</p>
                </div>
            </div>
        </Link>
    );
};

export default CartItem;