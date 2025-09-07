// src/pages/orderdetail/components/ProductList.jsx
import React from 'react';

const ProductList = ({ selectedBooks }) => {
  return (
    <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
      {selectedBooks.map((item) => (
        <div key={item.bookId} className="flex gap-4 mb-3">
          <img src={item.bookImage} alt={item.bookName} className="w-18 h-18 object-cover rounded-md" />
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-gray-600">{item.bookName}</span>
                <div className="mt-4">
                  {item.discountedPrice && item.discountedPrice < item.price ? (
                    <div className="flex items-center">
                      <span className="text-red-600">{item.discountedPrice.toLocaleString("vi-VN")} VND</span>
                      <span className="text-gray-600 line-through ml-2">{item.price.toLocaleString("vi-VN")} VND</span>
                    </div>
                  ) : (
                    <span className="text-gray-600">{item.price.toLocaleString("vi-VN")} VND</span>
                  )}
                </div>
              </div>
              <span className="text-gray-600 self-end">x{item.quantity}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;