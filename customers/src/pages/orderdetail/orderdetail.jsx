// src/pages/orderdetail/OrderDetail.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { PayPalButton } from "react-paypal-button-v2";
import AddressSection from "./components/AddressSection";
import ProductList from "./components/ProductList";
import VoucherDrawer from "./components/VoucherDrawer";
import PaymentSummary from "./components/PaymentSummary";
import { useVoucher } from "./hooks/useVoucher";
import * as orderService from "./services/orderService";

const OrderDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedBooks, address, totalAmount } = state;

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const userId = localStorage.getItem("accountId");

  const {
    publicVouchers, personalVouchers, appliedVoucher, voucherError,
    voucherCode, setVoucherCode, tabValue, setTabValue,
    isVoucherApplicable, handleSearch, applyVoucher,
    calculateDiscountAmount, calculateDiscountedTotal, setAppliedVoucher
  } = useVoucher(userId, totalAmount, drawerVisible);

  // Place order
  const handlePlaceOrder = async () => {
    const order = {
      accountId: userId,
      phoneNumber: address.phoneNumber,
      recipientName: address.recipientName,
      country: "Vietnam",
      city: address.city,
      district: address.district,
      ward: address.ward,
      totalPrice: calculateDiscountedTotal(),
      paymentMethod,
      orderItems: selectedBooks.map(({ bookId, bookName, bookImage, quantity, price, discountedPrice }) => ({
        bookId,
        bookName,
        bookImage,
        quantity,
        price: discountedPrice ?? price,
      })),
      orderStatus: paymentMethod === "COD" ? "Chưa thanh toán" : "Đã thanh toán",
      shippingStatus: "Chờ xử lý",
    };

    try {
      const res = await orderService.createOrder(order);
      if (res.status === 200) {
        // Track purchases
        await Promise.all(selectedBooks.map((book) => orderService.trackPurchase(book.bookId)));

        // Apply voucher if one was used
        if (appliedVoucher) {
          await orderService.applyVoucherToOrder(
            res.data.orderId,
            appliedVoucher.code,
            calculateDiscountedTotal()
          );
        }

        const obtainVouchersRes = await orderService.getObtainedVouchers(res.data.orderId);
        const obtainVouchers = obtainVouchersRes.data;
        
        alert("Đặt hàng thành công!");

        if (Array.isArray(obtainVouchers) && obtainVouchers.length > 0) {
          alert(`Bạn vừa đủ điều kiện để nhận được ${obtainVouchers.length} voucher. Hãy kiểm tra ví voucher của bạn.`);
        }
        
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
      <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-md flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-center text-gray-800">Chi tiết đơn hàng</h2>

        <AddressSection address={address} state={state} />
        <ProductList selectedBooks={selectedBooks} />

        {/* Voucher Section */}
        <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Áp dụng Voucher</h3>
          <Button variant="contained" onClick={() => setDrawerVisible(true)}>Chọn Voucher</Button>
          {appliedVoucher && (
            <div className="mt-2">
              <p><strong>Mã Voucher:</strong> {appliedVoucher.code}</p>
              <p className="text-sm">
                {appliedVoucher.voucherType === "Percentage Discount"
                  ? `Giảm ${appliedVoucher.percentageDiscount}% cho hóa đơn từ ${appliedVoucher.minOrderValue.toLocaleString("vi-VN")}VND, tối đa ${appliedVoucher.highestDiscountValue.toLocaleString("vi-VN")}VND.`
                  : `Giảm ${appliedVoucher.valueDiscount.toLocaleString("vi-VN")}VND cho hóa đơn từ ${appliedVoucher.minOrderValue.toLocaleString("vi-VN")}VND.`}
              </p>
            </div>
          )}
          {voucherError && <p className="text-red-500 text-sm mt-2">{voucherError}</p>}
        </div>

        {/* Voucher Drawer */}
        <VoucherDrawer
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
          tabValue={tabValue}
          setTabValue={setTabValue}
          voucherCode={voucherCode}
          setVoucherCode={setVoucherCode}
          handleSearch={handleSearch}
          publicVouchers={publicVouchers}
          personalVouchers={personalVouchers}
          isVoucherApplicable={(v) => {
            const now = new Date();
            const start = new Date(v.startDate);
            const end = new Date(v.endDate);
            return now >= start && now <= end && totalAmount >= v.minOrderValue;
          }}
          applyVoucher={(voucher) => {
            applyVoucher(voucher);
            setDrawerVisible(false); // Close drawer after applying
          }}
        />

        {/* Payment Method */}
        <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Phương thức thanh toán</h3>
          <div className="flex">
            <div className="flex flex-col">
              {["COD", "Paypal"].map((method, i) => (
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
              {["COD", "Paypal"].map((method, i) => (
                <div key={i}>
                  <label htmlFor={method}>
                    {method === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán sử dụng Paypal"}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <PaymentSummary
          totalAmount={totalAmount}
          discountAmount={calculateDiscountAmount()}
          discountedTotal={calculateDiscountedTotal()}
        />

        {/* Total and Place Order */}
        <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
          <h3 className="text-lg font-bold mb-3">
            Tổng tiền: {calculateDiscountedTotal().toLocaleString("vi-VN")} VND
          </h3>
          {paymentMethod === "COD" ? (
            <button
              className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
              onClick={handlePlaceOrder}
            >
              Đặt hàng
            </button>
          ) : (
            <PayPalButton
              amount={parseFloat((calculateDiscountedTotal() / 23000).toFixed(2))}
              onSuccess={async (details) => {
                alert("Transaction completed by " + details.payer.name.given_name);
                handlePlaceOrder();
              }}
              onError={() => {
                alert("Transaction failed");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;