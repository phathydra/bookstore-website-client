import React from "react";
import { Link } from "react-router-dom";

// Component này giờ chỉ nhận 'item' từ CartResponseDto.items
const CartItem = ({ item }) => { 
    // Lấy ảnh đầu tiên, hoặc ảnh mặc định nếu không có
    const imageUrl = item.bookImages && item.bookImages.length > 0 
                     ? item.bookImages[0] 
                     : "/path/to/default-book-image.png"; // <-- Thay bằng đường dẫn ảnh mặc định của bạn

    return (
        <Link
            // Link đến trang chi tiết sản phẩm (nếu có)
            to={`/productdetail/${item.bookId}`} 
            className="w-full"
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            <div className="flex items-center py-2 bg-white transition-colors duration-300 gap-4"> 
                <img 
                    src={imageUrl} 
                    alt={item.bookName} 
                    className="w-12 h-16 object-cover mr-4 flex-shrink-0" // Thêm flex-shrink-0
                />
                <div className="flex-1 min-w-0"> {/* Thêm min-w-0 để tên sách không tràn */}
                    {/* Tên sách */}
                    <p className="text-base font-medium truncate my-1">{item.bookName}</p> {/* Dùng truncate */}

                    {/* Giá gốc (originalPrice từ backend) */}
                    <p className="text-base text-blue-600 my-1">
                        {/* Dùng originalPrice */}
                        {Number(item.originalPrice).toLocaleString("vi-VN")} VND 
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default CartItem;