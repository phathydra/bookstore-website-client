import React, { useEffect, useState } from "react";
import SideNavProfile from './SideNavProfile';
import { Typography } from "@mui/material";
import ClaimableVoucher from '../../components/claimableVoucher/claimableVoucher';

const VouchersWallet = () => {
  const [walletVouchers, setWalletVouchers] = useState([]);
  const [claimableVouchers, setClaimableVouchers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('vouchers');
  const [loading, setLoading] = useState(true);

  const accountId = localStorage.getItem("accountId");

  const fetchWalletVouchers = async () => {
    try {
      const res = await fetch(`http://localhost:8082/api/vouchers/personal-voucher?accountId=${accountId}`);
      if (res.ok) {
        const data = await res.json();
        setWalletVouchers(data);
      } else {
        console.error("Failed to fetch personal vouchers");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClaimableVouchers = async () => {
    try {
      const res = await fetch(`http://localhost:8082/api/vouchers/claimable?accountId=${accountId}`);
      if (res.ok) {
        const data = await res.json();
        setClaimableVouchers(data);
      } else {
        console.error("Failed to fetch claimable vouchers");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchWalletVouchers(), fetchClaimableVouchers()]);
      setLoading(false);
    };
    fetchData();
  }, [accountId]);

  const calculateRemainingDays = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleClaimVoucher = async (voucher) => {
    try {
      const response = await fetch(`http://localhost:8082/api/vouchers/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: accountId,
          obtainableVoucherDto: voucher,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Đã claim voucher ${voucher.code} thành công!`);
        await Promise.all([fetchWalletVouchers(), fetchClaimableVouchers()]);
      } else {
        alert(data.statusMsg || "Claim voucher thất bại.");
      }
    } catch (error) {
      console.error("Error claiming voucher:", error);
      alert("Có lỗi khi claim voucher.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 ml-30">
      {/* Sidebar */}
      <SideNavProfile selected={selectedTab} onSelect={setSelectedTab} />

      {/* Content */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Ví Voucher</h2>

        {/* Claimable Vouchers */}
        {claimableVouchers.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Voucher có thể nhận</h3>
            <div className="flex space-x-4 overflow-x-auto max-w-full">
              {claimableVouchers.map((voucher) => (
                <div key={voucher.voucherCode} className="min-w-[200px]">
                  <ClaimableVoucher voucher={voucher} onClaim={handleClaimVoucher} />
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-3 text-gray-700">Voucher của bạn</h3>
        {/* Wallet Vouchers */}
        {loading ? (
        <Typography>Đang tải...</Typography>
        ) : walletVouchers.length === 0 ? (
        <Typography>Ví của bạn chưa có voucher nào.</Typography>
        ) : (
            <div className="grid grid-cols-2 gap-4">
            {walletVouchers.map((voucher) => (
              <div key={voucher.code} className="flex flex-col p-4 bg-white shadow rounded-xl">
                <span className="font-bold text-base truncate">{voucher.code}</span>
                <span className="text-xs text-gray-600 mt-1 truncate">
                  {voucher.voucherType === "Percentage Discount"
                    ? `Giảm ${voucher.percentageDiscount}% (tối đa ${voucher.highestDiscountValue?.toLocaleString("vi-VN")} VND)`
                    : `Giảm ${voucher.valueDiscount?.toLocaleString("vi-VN")} VND`}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  Dành cho đơn tối thiểu {voucher.minOrderValue?.toLocaleString("vi-VN")} VND
                </span>
                <span className="text-xs text-gray-400 truncate mt-1">
                    Giới hạn sử dụng: {voucher.usageLimit} lần
                </span>

                <span className="text-xs text-gray-400 truncate mt-1">
                    Còn lại: {calculateRemainingDays(voucher.endDate)} ngày
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VouchersWallet;
