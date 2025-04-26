import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  Drawer,
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material";

const OrderDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedBooks, address, totalAmount } = state;

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [publicVouchers, setPublicVouchers] = useState([]);
  const [personalVouchers, setPersonalVouchers] = useState([]);
  const [filteredPublicVouchers, setFilteredPublicVouchers] = useState([]);
  const [filteredPersonalVouchers, setFilteredPersonalVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");

  const userId = localStorage.getItem("accountId");

  // Fetch vouchers when drawer opens
  useEffect(() => {
    if (drawerVisible) {
      axios
        .get(`http://localhost:8082/api/vouchers/available-voucher?userId=${userId}`)
        .then((res) => {
          setPublicVouchers(res.data);
          setFilteredPublicVouchers(res.data);
        })
        .catch(() => setVoucherError("Failed to load public vouchers"));

      axios
        .get(`http://localhost:8082/api/vouchers/personal-voucher?userId=${userId}`)
        .then((res) => {
          setPersonalVouchers(res.data);
          setFilteredPersonalVouchers(res.data);
        })
        .catch(() => setVoucherError("Failed to load personal vouchers"));
    }
  }, [drawerVisible, userId]);

  // Check if voucher is applicable
  const isVoucherApplicable = (voucher) => {
    const now = new Date();
    const start = new Date(voucher.startDate);
    const end = new Date(voucher.endDate);
    return now >= start && now <= end && totalAmount >= voucher.minOrderValue;
  };

  // Handle voucher search by code
  const handleSearch = async () => {
    if (!voucherCode) {
      setFilteredPublicVouchers(publicVouchers);
      setFilteredPersonalVouchers(personalVouchers);
      setVoucherError("");
      return;
    }

    try {
      let res;
      if (tabValue === 0) {
        res = await axios.get(`http://localhost:8082/api/vouchers/get-voucher?code=${voucherCode}`);
        setFilteredPublicVouchers([res.data]);
        setFilteredPersonalVouchers(personalVouchers);
      } else {
        res = await axios.get(`http://localhost:8082/api/vouchers/personal?code=${voucherCode}`);
        setFilteredPersonalVouchers([res.data]);
        setFilteredPublicVouchers(publicVouchers);
      }
      setVoucherError("");
    } catch (err) {
      setVoucherError("Voucher not found");
      setFilteredPublicVouchers(publicVouchers);
      setFilteredPersonalVouchers(personalVouchers);
    }
  };

  // Apply selected voucher
  const applyVoucher = (voucher) => {
    if (!isVoucherApplicable(voucher)) {
      setVoucherError("Voucher is not applicable");
      return;
    }
    setAppliedVoucher(voucher);
    setDrawerVisible(false);
    setVoucherError("");
  };

  // Calculate discounted total
  const calculateDiscountedTotal = () => {
    if (!appliedVoucher) return totalAmount;
    const { voucherType, percentageDiscount, highestDiscountValue, valueDiscount } = appliedVoucher;
    let discount = voucherType === "Percentage Discount"
      ? Math.min((percentageDiscount / 100) * totalAmount, highestDiscountValue)
      : valueDiscount;
    return totalAmount - discount;
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!appliedVoucher) return 0;
    const { voucherType, percentageDiscount, highestDiscountValue, valueDiscount } = appliedVoucher;
    return voucherType === "Percentage Discount"
      ? Math.min((percentageDiscount / 100) * totalAmount, highestDiscountValue)
      : valueDiscount;
  };

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
      orderStatus: "Chưa thanh toán",
      shippingStatus: "Chờ xử lý",
    };

    try {
      const res = await axios.post("http://localhost:8082/api/orders/create", order);
      if (res.status === 200) {
        await Promise.all(selectedBooks.map((book) =>
          axios.post(`http://localhost:8081/api/analytics/${book.bookId}/purchase`)
        ));

        if (appliedVoucher) {
          await axios.post("http://localhost:8082/api/vouchers/apply-voucher", {
            orderId: res.data.id,
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
      <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-md flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-center text-gray-800">Chi tiết đơn hàng</h2>

        {/* Address */}
        <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex">
              <div className="w-10 flex justify-center items-start">
                <FaMapMarkerAlt className="text-red-500" />
              </div>
              <div className="flex-1">
                <p>{address.recipientName} ({address.phoneNumber})</p>
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

        {/* Products */}
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
        <Drawer anchor="right" open={drawerVisible} onClose={() => setDrawerVisible(false)}>
          <Box sx={{ width: 400, padding: 2 }}>
            <Box sx={{ display: "flex", gap: 1, marginBottom: 2 }}>
              <TextField
                label="Tìm voucher theo mã"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleSearch}>Tìm kiếm</Button>
            </Box>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Public Vouchers" />
              <Tab label="Personal Vouchers" />
            </Tabs>
            {tabValue === 0 && (
              <List>
                {filteredPublicVouchers.map((voucher) => (
                  <ListItem key={voucher.id}>
                    <Paper sx={{ padding: 2, width: "100%" }}>
                      <Typography><strong>Mã:</strong> {voucher.code}</Typography>
                      <Typography>
                        {voucher.voucherType === "Percentage Discount"
                          ? `Giảm ${voucher.percentageDiscount}% (tối đa ${voucher.highestDiscountValue.toLocaleString("vi-VN")}VND)`
                          : `Giảm ${voucher.valueDiscount.toLocaleString("vi-VN")}VND`}
                      </Typography>
                      <Typography>Hóa đơn tối thiểu: {voucher.minOrderValue.toLocaleString("vi-VN")}VND</Typography>
                      <Button
                        variant="contained"
                        disabled={!isVoucherApplicable(voucher)}
                        onClick={() => applyVoucher(voucher)}
                        sx={{ marginTop: 1 }}
                      >
                        Áp dụng
                      </Button>
                    </Paper>
                  </ListItem>
                ))}
              </List>
            )}
            {tabValue === 1 && (
              <List>
                {filteredPersonalVouchers.map((voucher) => (
                  <ListItem key={voucher.id}>
                    <Paper sx={{ padding: 2, width: "100%" }}>
                      <Typography><strong>Mã:</strong> {voucher.code}</Typography>
                      <Typography>
                        {voucher.voucherType === "Percentage Discount"
                          ? `Giảm ${voucher.percentageDiscount}% (tối đa ${voucher.highestDiscountValue.toLocaleString("vi-VN")}VND)`
                          : `Giảm ${voucher.valueDiscount.toLocaleString("vi-VN")}VND`}
                      </Typography>
                      <Typography>Hóa đơn tối thiểu: {voucher.minOrderValue.toLocaleString("vi-VN")}VND</Typography>
                      <Button
                        variant="contained"
                        disabled={!isVoucherApplicable(voucher)}
                        onClick={() => applyVoucher(voucher)}
                        sx={{ marginTop: 1 }}
                      >
                        Áp dụng
                      </Button>
                    </Paper>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Drawer>

        {/* Payment Method */}
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

        {/* Payment Details */}
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

        {/* Total and Place Order */}
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