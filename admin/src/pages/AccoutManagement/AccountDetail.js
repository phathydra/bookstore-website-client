import React, { useState } from "react";
import { Box, Typography, Divider, Button, Select, MenuItem } from "@mui/material";
import axios from "axios";

const AccountDetail = ({ selectedAccount, handleDeleteAccount }) => {
  const [role, setRole] = useState(selectedAccount?.role || "User");
  const [originalRole, setOriginalRole] = useState(selectedAccount?.role || "User");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRoleChanged, setIsRoleChanged] = useState(false);

  const handleDelete = async () => {
    try {
        await axios.delete(`http://localhost:8080/api/account/delete?accountId=${selectedAccount.accountId}`);
        handleDeleteAccount(null); // Ẩn form
        window.location.reload(); // Load lại trang
    } catch (error) {
        console.error("Error deleting account:", error);
    }
};


  const handleChangeRole = (event) => {
    const newRole = event.target.value;
    setRole(newRole);
    setIsRoleChanged(newRole !== originalRole); // Kiểm tra nếu có sự thay đổi để hiện nút Lưu
  };

  const handleSaveRole = async () => {
    setIsUpdating(true);
  
    const updatedData = {
        username: selectedAccount.username,
        password: selectedAccount.password,
        role: role, // role được cập nhật từ input
    };

    try {
        await axios.put(
            `http://localhost:8080/api/account/update-account?accountId=${selectedAccount.accountId}`,
            updatedData,
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        handleDeleteAccount(null); // Ẩn form
        window.location.reload(); // Load lại trang
    } catch (error) {
        console.error("Lỗi khi cập nhật quyền:", error.response ? error.response.data : error.message);
    }

    setIsUpdating(false);
};


  return (
    <Box width="800px" p={3} role="presentation" display="flex" flexDirection="column" sx={{ paddingTop: 1 }}>
      {selectedAccount && (
        <>
          <Box display="flex" mb={3} p={2} sx={{ border: "1px solid #ddd", borderRadius: "8px" }}>
            <Box sx={{ width: "100%", p: 2 }}>
              <Divider sx={{ width: "100%", mb: 2 }} />
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                {[
                  { label: "Account ID", value: selectedAccount.accountId },
                  { label: "Username", value: selectedAccount.username },
                  { label: "Password", value: selectedAccount.password },
                ].map((item, index) => (
                  <Box key={index} sx={{ width: "100%" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                      {item.label}:
                    </Typography>
                    <textarea
                      value={item.value}
                      readOnly
                      style={{
                        width: "100%",
                        minHeight: "30px",
                        padding: "2px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        backgroundColor: "#f9f9f9",
                        resize: "vertical",
                      }}
                    />
                  </Box>
                ))}

                {/* Role Selection */}
                <Box sx={{ width: "100%" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
                    Role:
                  </Typography>
                  <Select
                    value={role}
                    onChange={handleChangeRole}
                    fullWidth
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: "6px" }}
                    disabled={isUpdating}
                  >
                    <MenuItem value="User">User</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Buttons */}
          <Box className="flex justify-between" width="100%" display="flex" gap={2} p={2}>
            {isRoleChanged && (
              <Button variant="contained" color="primary" onClick={handleSaveRole} fullWidth disabled={isUpdating}>
                {isUpdating ? "Đang lưu..." : "Lưu"}
              </Button>
            )}
            <Button variant="contained" color="error" onClick={handleDelete} fullWidth>
              Xóa
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AccountDetail;
