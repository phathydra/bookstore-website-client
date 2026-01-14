import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import AddressSection from "./components/AddressSection";
import ProductList from "./components/ProductList";
import VoucherDrawer from "./components/VoucherDrawer";
import PaymentSummary from "./components/PaymentSummary";
import { useVoucher } from "./hooks/useVoucher";
import * as orderService from "./services/orderService";

const paypalScriptOptions = {
  "client-id": "YOUR_PAYPAL_CLIENT_ID_HERE",
  currency: "USD",
  intent: "capture",
  components: "buttons",
};

const OrderDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedBooks, address, totalAmount } = state || {};

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const userId = localStorage.getItem("accountId");

  const {
    publicVouchers,
    personalVouchers,
    appliedVoucher,
    voucherError,
    voucherCode,
    setVoucherCode,
    tabValue,
    setTabValue,
    isVoucherApplicable,
    handleSearch,
    applyVoucher,
    calculateDiscountAmount,
    calculateDiscountedTotal,
    setAppliedVoucher,
  } = useVoucher(userId, totalAmount, drawerVisible);

  // Place order
  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    // Track order success (fire-and-forget)
    try {
      const trackingItems = selectedBooks.map((book) => ({
        bookId: book.bookId,
        quantity: book.quantity,
        price: book.discountedPrice ?? book.price,
      }));

      const trackData = {
        accountId: userId,
        totalPrice: calculateDiscountedTotal(),
        paymentMethod: paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
        items: trackingItems,
      };

      orderService.trackOrderSuccess(trackData).catch((err) => {
        console.warn("Lỗi khi tracking đặt hàng (success):", err);
      });
    } catch (trackError) {
      console.warn("Lỗi chuẩn bị data tracking:", trackError);
    }

    // Prepare order data
    const order = {
      accountId: userId,
      phoneNumber: address.phoneNumber,
      recipientName: address.recipientName,
      country: "Vietnam",
      city: address.city,
      district: address.district,
      ward: address.ward,
      note: address.note,
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

    // Send order to backend
    try {
      const res = await orderService.createOrder(order);
      if (res.status === 200) {
        // Apply voucher if used
        if (appliedVoucher) {
          await orderService.applyVoucherToOrder(
            res.data.orderId,
            appliedVoucher.code,
            calculateDiscountedTotal()
          );
        }

        // Get obtained vouchers
        const obtainVouchersRes = await orderService.getObtainedVouchers(res.data.orderId);
        const obtainVouchers = obtainVouchersRes.data;

        alert("Đặt hàng thành công!");

        if (Array.isArray(obtainVouchers) && obtainVouchers.length > 0) {
          alert(`Bạn vừa đủ điều kiện để nhận được ${obtainVouchers.length} voucher. Hãy kiểm tra ví voucher của bạn.`);
        }

        navigate("/orderhistory");
      } else {
        alert("Có lỗi xảy ra khi đặt hàng.");
        setIsPlacingOrder(false);
      }
    } catch (err) {
      console.error(err);
      alert("Đặt hàng không thành công, vui lòng thử lại sau.");
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-5">
      <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-md flex flex-col space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Chi tiết đơn hàng</h2>

        <AddressSection address={address} state={state} />
        <ProductList selectedBooks={selectedBooks} />

        {/* Voucher Section */}
        <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Áp dụng Voucher</h3>
          <Button variant="contained" onClick={() => setDrawerVisible(true)}>
            Chọn Voucher
          </Button>
          {appliedVoucher && (
            <div className="mt-2">
              <p>
                <strong>Mã Voucher:</strong> {appliedVoucher.code}
              </p>
              <p className="text-sm">
                {appliedVoucher.voucherType === "Percentage Discount"
                  ? `Giảm ${appliedVoucher.percentageDiscount}% cho hóa đơn từ ${appliedVoucher.minOrderValue.toLocaleString(
                      "vi-VN"
                    )}VND, tối đa ${appliedVoucher.highestDiscountValue.toLocaleString("vi-VN")}VND.`
                  : `Giảm ${appliedVoucher.valueDiscount.toLocaleString("vi-VN")}VND cho hóa đơn từ ${appliedVoucher.minOrderValue.toLocaleString(
                      "vi-VN"
                    )}VND.`}
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
            setDrawerVisible(false);
          }}
        />

        {/* Payment Method */}
        <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Phương thức thanh toán</h3>
          <div className="flex items-center space-x-8">
            <div className="flex flex-col space-y-2">
              {["COD", "Paypal"].map((method) => (
                <div key={method} className="flex items-center">
                  <input
                    type="radio"
                    id={method}
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="mr-2"
                  />
                  <label htmlFor={method}>
                    {method === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán qua Paypal"}
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

        {/* Total + Place Order Button / PayPal */}
        <div className="border border-gray-300 p-6 rounded-lg bg-gray-50">
          <h3 className="text-xl font-bold mb-4 text-center">
            Tổng tiền: {calculateDiscountedTotal().toLocaleString("vi-VN")} VND
          </h3>

          <PayPalScriptProvider options={paypalScriptOptions} deferLoading={false}>
            {paymentMethod === "COD" ? (
              <button
                className={`w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition ${
                  isPlacingOrder ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            ) : (
              <PayPalButtons
                style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
                disabled={isPlacingOrder}
                createOrder={(data, actions) => {
                  const amountInUSD = (calculateDiscountedTotal() / 23000).toFixed(2); // Adjust rate as needed
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: amountInUSD,
                          currency_code: "USD",
                        },
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  if (isPlacingOrder) return;
                  return actions.order.capture().then((details) => {
                    alert(`Thanh toán thành công bởi ${details.payer.name.given_name}`);
                    handlePlaceOrder(); // Save order to your backend
                  });
                }}
                onError={(err) => {
                  console.error("Lỗi thanh toán PayPal:", err);
                  alert("Thanh toán không thành công. Vui lòng thử lại.");
                }}
              />
            )}
          </PayPalScriptProvider>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;