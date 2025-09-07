import React from 'react';

const PaymentSummary = ({ totalAmount, discountAmount, discountedTotal }) => {
  return (
    <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Chi tiết thanh toán</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Tổng giá:</span>
          <span>{totalAmount.toLocaleString("vi-VN")} VND</span>
        </div>
        <div className="flex justify-between">
          <span>Tổng tiền giảm giá:</span>
          <span>{discountAmount.toLocaleString("vi-VN")} VND</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Tổng thanh toán:</span>
          <span>{discountedTotal.toLocaleString("vi-VN")} VND</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;