import React from "react";

const ClaimableVoucher = ({ voucher, onClaim }) => {
  return (
    <div className="flex justify-between items-center border rounded-2xl p-3 min-w-[260px] max-w-[260px] h-[100px] bg-white shadow hover:shadow-md transition overflow-hidden">
      {/* Left Side: Code + Info */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <span className="font-bold text-base truncate">{voucher.code}</span>
        <span className="text-xs text-gray-600 mt-1 truncate">
          {voucher.voucherType === "Percentage Discount"
            ? `Giảm ${voucher.percentageDiscount}% (tối đa ${voucher.highestDiscountValue?.toLocaleString("vi-VN")} VND)`
            : `Giảm ${voucher.valueDiscount?.toLocaleString("vi-VN")} VND`}
        </span>
        <span className="text-xs text-gray-400 truncate">
          Dành cho đơn tối thiểu {voucher.minOrderValue?.toLocaleString("vi-VN")} VND
        </span>
      </div>

      {/* Right Side: Claim Button */}
      <button
        onClick={() => onClaim(voucher)}
        className="ml-4 bg-blue-500 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-full"
      >
        Claim
      </button>
    </div>
  );
};

export default ClaimableVoucher;
