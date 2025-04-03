import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Typography, Box } from "@mui/material";
import "./orderDetail.css";

const OrderDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedBooks, address, totalAmount } = location.state;

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [voucherCode, setVoucherCode] = useState("");
    const [voucher, setVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null);

    // Handle voucher code input and continuous search
    const handleVoucherChange = async (e) => {
        const code = e.target.value;
        setVoucherCode(code);
        setVoucherError("");
        setVoucher(null);
    
        if (code) {
            try {
                const response = await axios.get(`http://localhost:8082/api/vouchers/get-voucher?code=${code}`);
                setVoucher(response.data);
            } catch (error) {
                setVoucherError("Voucher not found");
            }
        }
    };
    

    // Apply voucher and check conditions
    const applyVoucher = () => {
        if (!voucher) {
            setVoucherError("Please enter a valid voucher code");
            return;
        }

        const currentDate = new Date();
        const startDate = new Date(voucher.startDate);
        const endDate = new Date(voucher.endDate);

        // Check conditions
        if (currentDate < startDate || currentDate > endDate) {
            setVoucherError("Requirement not met. Can't use voucher");
            return;
        }

        if (totalAmount < voucher.minOrderValue) {
            setVoucherError("Requirement not met. Can't use voucher");
            return;
        }

        // If conditions are met
        setAppliedVoucher(voucher);
        setVoucherError("");
        alert("Successfully added voucher");
    };

    // Calculate total price with discount
    const calculateDiscountedTotal = () => {
        if (!appliedVoucher) return totalAmount;

        let discount = 0;
        if (appliedVoucher.voucherType === "Percentage Discount") {
            discount = (appliedVoucher.percentageDiscount / 100) * totalAmount;
            if(discount > appliedVoucher.highestDiscountValue) discount = appliedVoucher.highestDiscountValue;
        } else if (appliedVoucher.voucherType === "Value Discount") {
            discount = appliedVoucher.valueDiscount;
        }

        return totalAmount - discount;
    };

    // Handle order submission
    const handlePlaceOrder = async () => {
        const order = {
            accountId: localStorage.getItem("accountId"),
            phoneNumber: address.phoneNumber,
            recipientName: address.recipientName,
            country: "Vietnam",
            city: address.city,
            district: address.district,
            ward: address.ward,
            note: address.note,
            totalPrice: totalAmount,
            paymentMethod: paymentMethod,
            orderItems: selectedBooks.map((item) => ({
                bookId: item.bookId,
                bookName: item.bookName,
                bookImage: item.bookImage,
                quantity: item.quantity,
                price:
                    item.discountedPrice !== undefined && item.discountedPrice !== null
                        ? item.discountedPrice
                        : item.price,
            })),
            orderStatus: "Chưa thanh toán",
            shippingStatus: "Chờ xử lý",
        };


        try {
            const orderResponse = await axios.post("http://localhost:8082/api/orders/create", order);
            if (orderResponse.status === 200) {
                if(appliedVoucher !== null){
                    const orderVoucher = {
                        orderId: orderResponse.id,
                        voucherId: appliedVoucher.id,
                        discountedPrice: calculateDiscountedTotal(),
                    }
                    console.log(orderVoucher);
                    const voucherResponse = await axios.post(`http://localhost:8082/api/vouchers/apply-voucher`, orderVoucher);
                    if(voucherResponse.status === 200) {
                        alert("Đặt hàng thành công!");
                        navigate("/orderhistory");
                    }
                    else {
                        alert("Có lỗi xảy ra khi đặt hàng.");
                    }
                }
            } else {
                alert("Có lỗi xảy ra khi đặt hàng.");
            }
        } catch (error) {
            console.error("Lỗi khi gửi đơn hàng:", error);
            alert("Đặt hàng không thành công, vui lòng thử lại sau.");
        }
    };

    return (
        <div className="order-detail-wrapper">
            <div className="order-detail">
                <h2>Chi tiết đơn hàng</h2>
                <div className="order-info">
                    <h3>Thông tin người nhận</h3>
                    <div className="info-item">
                        <label>Tên người nhận: </label>
                        <span>{address.recipientName}</span>
                    </div>
                    <div className="info-item">
                        <label>Số điện thoại: </label>
                        <span>{address.phoneNumber}</span>
                    </div>
                    <div className="info-item">
                        <label>Địa chỉ: </label>
                        <span>{address.city}, {address.district}, {address.ward}</span>
                    </div>
                    <div className="info-item">
                        <label>Ghi chú: </label>
                        <span>{address.note}</span>
                    </div>
                </div>
                <div className="order-items">
                    <h3>Sản phẩm đã chọn</h3>
                    {selectedBooks.map((item) => (
                        <div key={item.bookId} className="order-item">
                            <img src={item.bookImage} alt={item.bookName} className="order-item-image" />
                            <div className="order-item-info">
                                <div className="order-item-name">
                                    <label>Tên sản phẩm: </label>
                                    <span>{item.bookName}</span>
                                </div>
                                <div className="order-item-quantity">
                                    <label>Số lượng: </label>
                                    <span>{item.quantity}</span>
                                </div>
                                <div className="order-item-price">
                                    <label>Giá: </label>
                                    <span>
                                        {(item.discountedPrice !== undefined && item.discountedPrice !== null
                                            ? item.discountedPrice
                                            : item.price
                                        ).toLocaleString("vi-VN")}{" "}
                                        VND
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Voucher Section */}
                <div className="voucher-section">
                    <h3>Áp dụng Voucher</h3>
                    <TextField
                        label="Nhập mã voucher"
                        value={voucherCode}
                        onChange={handleVoucherChange}
                        fullWidth
                        margin="normal"
                    />
                    {voucher && (
                        <Box mt={2}>
                            <Typography>
                                <strong>Mã Voucher:</strong> {voucher.code}
                            </Typography>
                            <Typography>
                                <strong>Detail:</strong> {voucher.voucherType === "Percentage Discount" ?
                                "Giảm " + voucher.percentageDiscount + "% cho hóa đơn từ " + voucher.minOrderValue.toLocaleString("vi-VN") + "VND, tối đa " + voucher.highestDiscountValue.toLocaleString("vi-VN") + "VND."
                                :"Giảm " + voucher.valueDiscount.toLocaleString("vi-VN") + "VND cho hóa đơn từ " + voucher.minOrderValue.toLocaleString("vi-VN") + "VND."}
                            </Typography>
                            <Button variant="contained" color="primary" onClick={applyVoucher}>
                                Áp dụng
                            </Button>
                        </Box>
                    )}
                    {voucherError && <Typography color="error">{voucherError}</Typography>}
                </div>

                <div className="payment-method">
                    <h3>Phương thức thanh toán</h3>
                    <div className="payment-options">
                        <div>
                            <input
                                type="radio"
                                id="cod"
                                name="paymentMethod"
                                value="COD"
                                checked={paymentMethod === "COD"}
                                onChange={() => setPaymentMethod("COD")}
                            />
                            <label htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="bank"
                                name="paymentMethod"
                                value="Bank"
                                checked={paymentMethod === "Bank"}
                                onChange={() => setPaymentMethod("Bank")}
                            />
                            <label htmlFor="bank">Chuyển khoản ngân hàng</label>
                        </div>
                    </div>
                </div>

                <div className="order-total">
                    <h3>Tổng tiền: {calculateDiscountedTotal().toLocaleString("vi-VN")} VND</h3>
                </div>

                <button className="place-order-button" onClick={handlePlaceOrder}>
                    Đặt hàng
                </button>
            </div>
        </div>
    );
};

export default OrderDetail;