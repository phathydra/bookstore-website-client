import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";

const OrderDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedBooks, address, totalAmount } = state;

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [voucherCode, setVoucherCode] = useState("");
    const [voucher, setVoucher] = useState(null);
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState("");

    const handleVoucherChange = async (e) => {
        const code = e.target.value;
        setVoucherCode(code);
        setVoucher(null);
        setVoucherError("");

        if (code) {
            try {
                const res = await axios.get(`http://localhost:8082/api/vouchers/get-voucher?code=${code}`);
                setVoucher(res.data);
            } catch {
                setVoucherError("Voucher not found");
            }
        }
    };

    const applyVoucher = () => {
        if (!voucher) return setVoucherError("Please enter a valid voucher code");

        const now = new Date();
        const start = new Date(voucher.startDate);
        const end = new Date(voucher.endDate);

        if (now < start || now > end || totalAmount < voucher.minOrderValue) {
            return setVoucherError("Requirement not met. Can't use voucher");
        }

        setAppliedVoucher(voucher);
        setVoucherError("");
        alert("Successfully added voucher");
    };

    const calculateDiscountedTotal = () => {
        if (!appliedVoucher) return totalAmount;
        const { voucherType, percentageDiscount, highestDiscountValue, valueDiscount } = appliedVoucher;

        let discount = voucherType === "Percentage Discount"
            ? Math.min((percentageDiscount / 100) * totalAmount, highestDiscountValue)
            : valueDiscount;

        return totalAmount - discount;
    };

    const calculateDiscountAmount = () => {
        if (!appliedVoucher) return 0;
        const { voucherType, percentageDiscount, highestDiscountValue, valueDiscount } = appliedVoucher;

        return voucherType === "Percentage Discount"
            ? Math.min((percentageDiscount / 100) * totalAmount, highestDiscountValue)
            : valueDiscount;
    };

    const handlePlaceOrder = async () => {
        const order = {
            accountId: localStorage.getItem("accountId"),
            phoneNumber: address.phoneNumber,
            recipientName: address.recipientName,
            country: "Vietnam",
            city: address.city,
            district: address.district,
            ward: address.ward,
            totalPrice: totalAmount,
            paymentMethod,
            orderItems: selectedBooks.map(({ bookId, bookName, bookImage, quantity, price, discountedPrice }) => ({
                bookId,
                bookName,
                bookImage,
                quantity,
                price: discountedPrice ?? price,
            })),
            orderStatus: "Chưa thanh toán",
            shippingStatus: "Chờ xử lý",
        };

        try {
            const res = await axios.post("http://localhost:8082/api/orders/create", order);
            if (res.status === 200) {
                if (appliedVoucher) {
                    await axios.post("http://localhost:8082/api/vouchers/apply-voucher", {
                        orderId: res.id,
                        voucherId: appliedVoucher.id,
                        discountedPrice: calculateDiscountedTotal(),
                    });
                }
                alert("Đặt hàng thành công!");
                navigate("/orderhistory");
            } else {
                alert("Có lỗi xảy ra khi đặt hàng.");
            }
        } catch (err) {
            console.error(err);
            alert("Đặt hàng không thành công, vui lòng thử lại sau.");
        }
    };

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-100 p-5">
          <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-md flex flex-col !space-y-2">
            <h2 className="text-2xl font-bold text-center text-gray-800">Chi tiết đơn hàng</h2>
            {/* 1. Địa chỉ */}
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex">
                  <div className="w-10 flex justify-center items-start">
                    <FaMapMarkerAlt className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p>
                      {address.recipientName} ({address.phoneNumber})
                    </p>
                    {address.note && <p>{address.note}</p>}
                    <p>{`${address.city}, ${address.district}, ${address.ward}`}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/addressselection", { state: state })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdKeyboardArrowRight size={24} />
                </button>
              </div>
            </div>

                {/* 2. Sản phẩm */}
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
                                                    <span className="text-red-600">
                                                        {item.discountedPrice.toLocaleString("vi-VN")} VND
                                                    </span>
                                                    <span className="text-gray-600 line-through ml-2">
                                                        {item.price.toLocaleString("vi-VN")} VND
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">
                                                    {item.price.toLocaleString("vi-VN")} VND
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-gray-600 self-end">x{item.quantity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Voucher */}
                <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Áp dụng Voucher</h3>
                        <input
                            type="text"
                            className="w-full border border-gray-300 p-2 rounded-md mb-2"
                            placeholder="Nhập mã voucher"
                            value={voucherCode}
                            onChange={handleVoucherChange}
                        />
                        {voucher && (
                            <div className="space-y-1 mb-2">
                                <p><strong>Mã Voucher:</strong> {voucher.code}</p>
                                <p className="text-sm">
                                    {voucher.voucherType === "Percentage Discount"
                                        ? `Giảm ${voucher.percentageDiscount}% cho hóa đơn từ ${voucher.minOrderValue.toLocaleString("vi-VN")}VND, tối đa ${voucher.highestDiscountValue.toLocaleString("vi-VN")}VND.`
                                        : `Giảm ${voucher.valueDiscount.toLocaleString("vi-VN")}VND cho hóa đơn từ ${voucher.minOrderValue.toLocaleString("vi-VN")}VND.`}
                                </p>
                                <button onClick={applyVoucher} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Áp dụng
                                </button>
                            </div>
                        )}
                        {voucherError && <p className="text-red-500 text-sm">{voucherError}</p>}
                    </div>
                </div>

                {/* 4. Phương thức thanh toán */}
                <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold mb-2">Phương thức thanh toán</h3>
                    <div className="flex">
                        <div className="flex flex-col">
                            {["COD", "Bank"].map((method, i) => (
                                <div key={i} className="ml-4">
                                    <input
                                        type="radio"
                                        id={method}
                                        name="paymentMethod"
                                        value={method}
                                        checked={paymentMethod === method}
                                        onChange={() => setPaymentMethod(method)}
                                        className="!mr-2"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            {["COD", "Bank"].map((method, i) => (
                                <div key={i}>
                                    <label htmlFor={method}>
                                        {method === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng"}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. Chi tiết thanh toán */}
                <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold mb-2">Chi tiết thanh toán</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Tổng giá:</span>
                            <span>{totalAmount.toLocaleString("vi-VN")} VND</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tổng tiền giảm giá:</span>
                            <span>{calculateDiscountAmount().toLocaleString("vi-VN")} VND</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tổng thanh toán:</span>
                            <span>{calculateDiscountedTotal().toLocaleString("vi-VN")} VND</span>
                        </div>
                    </div>
                </div>

                {/* 6. Tổng tiền + nút đặt hàng */}
                <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-bold mb-3">
                        Tổng tiền: {calculateDiscountedTotal().toLocaleString("vi-VN")} VND
                    </h3>
                    <button
                        className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                        onClick={handlePlaceOrder}
                    >
                        Đặt hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;