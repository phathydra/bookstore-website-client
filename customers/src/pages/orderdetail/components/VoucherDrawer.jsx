import React from "react";
import {
  Drawer,
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";

const VoucherDrawer = ({
  drawerVisible,
  setDrawerVisible,
  tabValue,
  setTabValue,
  voucherCode,
  setVoucherCode,
  handleSearch,
  publicVouchers,
  personalVouchers,
  isVoucherApplicable,
  applyVoucher,
}) => {
  const formatMoney = (value) =>
    value != null ? value.toLocaleString("vi-VN") : "";

  const renderVoucherCard = (voucher) => {
    if (!voucher) return null;

    const isApplicable = isVoucherApplicable(voucher);

    let discountText = "";
    let maxDiscountPart = "";

    if (voucher.voucherType === "Percentage Discount") {
      discountText = `Giảm ${voucher.percentageDiscount}%`;

      if (voucher.highestDiscountValue != null) {
        maxDiscountPart = ` (tối đa ${formatMoney(voucher.highestDiscountValue)} VND)`;
      }
    } else {
      const fixedValue = formatMoney(voucher.valueDiscount);
      discountText = fixedValue
        ? `Giảm ${fixedValue} VND`
        : "Giảm giá đặc biệt";
    }

    const fullDiscountText = discountText + maxDiscountPart;

    const cardBgColor = isApplicable
      ? "bg-gradient-to-r from-red-50 to-red-100"
      : "bg-gray-100";
    const borderColor = isApplicable ? "border-red-400" : "border-gray-300";
    const discountColor = isApplicable ? "text-red-600" : "text-gray-500";
    const textColor = isApplicable ? "text-gray-700" : "text-gray-500";
    const buttonBgColor = isApplicable
      ? "bg-red-500 hover:bg-red-600"
      : "bg-gray-400";
    const buttonText = isApplicable ? "Áp dụng" : "Không dùng được";

    const endDate = voucher.endDate ? new Date(voucher.endDate) : null;
    const now = new Date();
    let timeLeftInDays = null;
    let isExpiringSoon = false;

    if (endDate && !isNaN(endDate)) {
      timeLeftInDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      isExpiringSoon = timeLeftInDays > 0 && timeLeftInDays <= 10;
    }

    return (
      <div
        key={voucher.id}
        className={`relative w-full shadow-md mb-6 flex border-2 ${borderColor} ${cardBgColor}`}
        style={{
          borderStyle: "dashed",
          borderRadius: "12px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Vết cắt tròn bên trái */}
        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full border border-gray-300 transform -translate-y-1/2" />
        {/* Vết cắt tròn bên phải */}
        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full border border-gray-300 transform -translate-y-1/2" />

        {/* Nội dung voucher */}
        <div className="flex-grow p-4">
          <Typography
            variant="h6"
            className={`text-lg font-bold ${discountColor}`}
          >
            {fullDiscountText}
          </Typography>

          <Typography variant="body2" className={`mt-1 ${textColor}`}>
            Đơn tối thiểu:{" "}
            {voucher.minOrderValue != null
              ? `${formatMoney(voucher.minOrderValue)} VND`
              : "Không yêu cầu"}
          </Typography>

          <div className="flex items-center mt-1 text-sm">
            <span className={textColor}>
              Hạn dùng:{" "}
              {voucher.endDate
                ? new Date(voucher.endDate).toLocaleDateString("vi-VN")
                : "Không giới hạn"}
            </span>

            {isExpiringSoon && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold text-xs animate-pulse">
                Còn {timeLeftInDays} ngày
              </span>
            )}
          </div>

          {/* Hiển thị mã voucher */}
          <div className="mt-2 font-mono text-sm font-bold text-gray-700 bg-white px-2 py-1 inline-block rounded border border-dashed border-gray-400">
            Mã: {voucher.code || "N/A"}
          </div>
        </div>

        {/* Cột phải: Nút áp dụng */}
        <div className="flex-shrink-0 flex items-center px-4 border-l border-dashed border-gray-300">
          <Button
            variant="contained"
            onClick={isApplicable ? () => applyVoucher(voucher) : undefined}
            disabled={!isApplicable}
            className={`${buttonBgColor} text-white font-bold py-2 px-6 rounded-full text-sm shadow-md transition-all`}
            sx={{ whiteSpace: "nowrap" }}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Drawer
      anchor="bottom"
      open={drawerVisible}
      onClose={() => setDrawerVisible(false)}
      PaperProps={{
        sx: {
          width: "95%",
          maxWidth: "700px",
          height: "90vh",
          margin: "auto",
          borderRadius: "16px 16px 0 0",
        },
      }}
    >
      <Box
        sx={{ padding: 3, display: "flex", flexDirection: "column", height: "100%" }}
      >
        {/* Ô nhập mã voucher */}
        <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
          <TextField
            label="Nhập mã voucher"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            fullWidth
            InputLabelProps={{ sx: { color: "text.secondary" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "divider" },
                "&:hover fieldset": { borderColor: "primary.main" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              whiteSpace: "nowrap",
              minWidth: "120px",
              fontWeight: "bold",
              borderRadius: "8px",
              bgcolor: "red.500",
              "&:hover": { bgcolor: "red.600" },
            }}
          >
            Tìm kiếm
          </Button>
        </Box>

        {/* Tabs chọn voucher */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
          sx={{
            "& .MuiTabs-indicator": { backgroundColor: "red" },
            "& .MuiTab-root.Mui-selected": { color: "red", fontWeight: "bold" },
          }}
        >
          <Tab label="Voucher có sẵn" sx={{ fontSize: "1rem" }} />
          <Tab label="Voucher của bạn" sx={{ fontSize: "1rem" }} />
        </Tabs>

        {/* Danh sách voucher */}
        <div
          className="mt-4 flex-grow overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#ccc transparent" }}
        >
          {tabValue === 0 &&
            (publicVouchers?.length > 0 ? (
              publicVouchers.map(renderVoucherCard)
            ) : (
              <Typography className="text-center text-gray-500 mt-4 text-lg">
                Không có voucher công khai nào.
              </Typography>
            ))}

          {tabValue === 1 &&
            (personalVouchers?.length > 0 ? (
              personalVouchers.map(renderVoucherCard)
            ) : (
              <Typography className="text-center text-gray-500 mt-4 text-lg">
                Bạn chưa có voucher nào.
              </Typography>
            ))}
        </div>
      </Box>
    </Drawer>
  );
};

export default VoucherDrawer;