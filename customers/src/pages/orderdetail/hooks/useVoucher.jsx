import { useState, useEffect } from "react";
import * as orderService from "../services/orderService";

export const useVoucher = (userId, totalAmount, drawerVisible) => {
  const [publicVouchers, setPublicVouchers] = useState([]);
  const [personalVouchers, setPersonalVouchers] = useState([]);
  const [filteredPublicVouchers, setFilteredPublicVouchers] = useState([]);
  const [filteredPersonalVouchers, setFilteredPersonalVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [tabValue, setTabValue] = useState(0);

  // Fetch vouchers when drawer opens or user changes
  useEffect(() => {
    if (drawerVisible && userId) {
      orderService.getAvailableVouchers(userId)
        .then((res) => {
          setPublicVouchers(res.data);
          setFilteredPublicVouchers(res.data);
        })
        .catch(() => setVoucherError("Failed to load public vouchers"));

      orderService.getPersonalVouchers(userId)
        .then((res) => {
          setPersonalVouchers(res.data);
          setFilteredPersonalVouchers(res.data);
        })
        .catch(() => setVoucherError("Failed to load personal vouchers"));
    }
  }, [drawerVisible, userId]);

  // Check if a voucher is currently applicable
  const isVoucherApplicable = (voucher) => {
    const now = new Date();
    const start = new Date(voucher.startDate);
    const end = new Date(voucher.endDate);
    return now >= start && now <= end && totalAmount >= voucher.minOrderValue;
  };

  // Search for a voucher by its code
  const handleSearch = async () => {
    if (!voucherCode) {
      setFilteredPublicVouchers(publicVouchers);
      setFilteredPersonalVouchers(personalVouchers);
      setVoucherError("");
      return;
    }

    try {
      const isPersonal = tabValue === 1;
      const res = await orderService.searchVoucherByCode(voucherCode, isPersonal);
      
      setVoucherError("");
      if (isPersonal) {
        setFilteredPersonalVouchers([res.data]);
        setFilteredPublicVouchers(publicVouchers);
      } else {
        setFilteredPublicVouchers([res.data]);
        setFilteredPersonalVouchers(personalVouchers);
      }
    } catch (err) {
      setVoucherError("Voucher not found");
      setFilteredPublicVouchers(publicVouchers);
      setFilteredPersonalVouchers(personalVouchers);
    }
  };

  // Apply the selected voucher
  const applyVoucher = (voucher) => {
    if (!isVoucherApplicable(voucher)) {
      setVoucherError("Voucher is not applicable");
      return;
    }
    setAppliedVoucher(voucher);
    setVoucherError("");
  };

  // Calculate the discount amount
  const calculateDiscountAmount = () => {
    if (!appliedVoucher) return 0;

    const { voucherType, percentageDiscount, highestDiscountValue, valueDiscount } = appliedVoucher;
    let discount = 0;

    if (voucherType === "Percentage Discount") {
      discount = Math.min((percentageDiscount / 100) * totalAmount, highestDiscountValue);
    } else if (voucherType === "Value Discount") {
      discount = valueDiscount;
    }

    return discount;
  };
  
  const calculateDiscountedTotal = () => {
    return totalAmount - calculateDiscountAmount();
  };

  return {
    publicVouchers: filteredPublicVouchers,
    personalVouchers: filteredPersonalVouchers,
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
  };
};