import imagesources from "./assets/images";

const products = [
    {name: "Book1", author: "Author1", price:50000, image:imagesources[0]},
    {name: "Book2", author: "Author2", price:50000, image:imagesources[1]},
    {name: "Book3", author: "Author3", price:50000, image:imagesources[2]},
    {name: "Book4", author: "Author4", price:50000, image:imagesources[3]},
    {name: "Book1", author: "Author1", price:50000, image:imagesources[0]},
    {name: "Book2", author: "Author2", price:50000, image:imagesources[1]},
    {name: "Book3", author: "Author3", price:50000, image:imagesources[2]},
    {name: "Book4", author: "Author4", price:50000, image:imagesources[3]}
];

const cartItems = [
    {
        image: imagesources[0],
        name: "Sách Lập Trình JavaScript",
        author: "Tác giả A",
        price: 200000,
        initialQuantity: 1
    },
    {
        image: imagesources[1],
        name: "Sách Khoa Học",
        author: "Tác giả B",
        price: 150000,
        initialQuantity: 2
    },
    {
        image: imagesources[2],
        name: "Sách Lịch Sử Việt Nam",
        author: "Tác giả C",
        price: 100000,
        initialQuantity: 3
    }
];

const orders = [
    {
        time: "2025-01-15T10:30:00Z",
        status: "Đã giao",
        items: [
            { name: "Sách Toán Lớp 12", quantity: 1 },
            { name: "Sách Lịch Sử Việt Nam", quantity: 2 }
        ],
        totalAmount: 180000,
        paymentMethod: "Thanh toán khi nhận hàng",
        phoneNumber: "0987654321",
        deliveryAddress: "Số 15, Ngõ 123, Quận Cầu Giấy, Hà Nội"
    },
    {
        time: "2025-01-14T14:45:00Z",
        status: "Đang giao",
        items: [
            { name: "Tiểu thuyết Sherlock Holmes", quantity: 1 },
            { name: "Sách Khoa học Thường Thức", quantity: 1 }
        ],
        totalAmount: 250000,
        paymentMethod: "Thẻ tín dụng",
        phoneNumber: "0934567890",
        deliveryAddress: "Số 89, Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
    },
    {
        time: "2025-01-13T09:00:00Z",
        status: "Đã hủy",
        items: [
            { name: "Sách Văn Học Hiện Đại", quantity: 3 }
        ],
        totalAmount: 120000,
        paymentMethod: "Ví điện tử Momo",
        phoneNumber: "0912345678",
        deliveryAddress: "Số 20, Đường Lê Lợi, Quận Thanh Xuân, Hà Nội"
    },
    {
        time: "2025-01-12T18:15:00Z",
        status: "Đã giao",
        items: [
            { name: "Sách Lập Trình JavaScript", quantity: 1 },
            { name: "Sách Thiết Kế Web", quantity: 1 }
        ],
        totalAmount: 400000,
        paymentMethod: "Thanh toán khi nhận hàng",
        phoneNumber: "0965432109",
        deliveryAddress: "Số 50, Đường Trần Phú, Quận Hải Châu, Đà Nẵng"
    },
    {
        time: "2025-01-11T16:00:00Z",
        status: "Chờ xác nhận",
        items: [
            { name: "Sách Học IELTS", quantity: 2 },
            { name: "Sách Luyện Viết Tiếng Anh", quantity: 1 }
        ],
        totalAmount: 350000,
        paymentMethod: "Thẻ tín dụng",
        phoneNumber: "0976543210",
        deliveryAddress: "Số 75, Đường Hoàng Diệu, Quận Ba Đình, Hà Nội"
    }
];

export default {orders, cartItems, products};