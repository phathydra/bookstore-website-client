import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DeliveryUnitHeader from '../DeliveryUnitHeader';
import ChatWindow from "./components/ChatWindow";
import ConversationCard from "./components/ConversationCard";

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const accountId = localStorage.getItem("accountId");
  const navigate = useNavigate();

  const tabs =
    role === "Shipper"
      ? ["Customer", "Delivery unit", "Admin"]
      : role === "DeliveryUnit"
      ? ["Customer", "Shipper", "Admin"]
      : ["Customer", "Admin"];

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!accountId) return;
      try {
        const res = await axios.get(
          `http://localhost:8080/api/account/fetch?accountId=${accountId}`
        );
        setRole(res.data.role);
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };

    const fetchConversations = async () => {
      if (!accountId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:8083/api/conversation/fetch?accountId=${accountId}`
        );
        setConversations(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setIsLoading(false);
      }
    };

    fetchUserRole();
    fetchConversations();
  }, [accountId]);

  useEffect(() => {
    if (role && !activeTab) {
      setActiveTab(tabs[0]);
    }
  }, [role, tabs]);

  const filteredConversations = conversations.filter((conv) => {
    if (activeTab === "Customer") {
      return conv.channelType === role;
    } else {
      return conv.channelType === activeTab;
    }
  });

  const handleNewConversation = async () => {
    if (activeTab !== "Admin") return;
    try {
      const nameRes = await axios.get(
        `http://localhost:8080/api/account/fetch?accountId=${accountId}`
      );

      const newConv = {
        accountId1: "Admin",
        accountId2: accountId,
        title1: "Admin support",
        title2: nameRes.data.name,
        channelType: "Admin",
      };

      const res = await axios.post(
        "http://localhost:8083/api/conversation/create",
        newConv
      );

      setConversations((prev) => [res.data, ...prev]);
      setSelectedConversation(res.data.id);
    } catch (err) {
      console.error("Error creating admin conversation:", err);
    }
  };

  const handleSelectConversation = (id) => {
    setSelectedConversation(id);
  };

  // DeliveryUnitHeader handlers
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleGoToDashboard = () => {
    handleMenuClose();
    navigate('/DeliveryUnitInfo');
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem("accountId");
    localStorage.removeItem("role");
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DeliveryUnitHeader
        userId={accountId}
        anchorEl={anchorEl}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        handleGoToInfo={handleGoToDashboard}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col pt-4 px-4 overflow-hidden">
        <div className="flex h-full rounded-xl shadow-lg bg-white overflow-hidden border">
          {/* Sidebar */}
          <div className="w-1/4 border-r flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "Admin" && (
              <button
                onClick={handleNewConversation}
                className="w-full mb-3 py-2 px-4 mx-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-medium"
              >
                + Tạo cuộc trò chuyện mới
              </button>
            )}

            <div className="flex-1 overflow-y-auto p-3">
              {isLoading ? (
                <div className="text-center text-gray-400 mt-10">Đang tải...</div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversation === conversation.id}
                    onClick={handleSelectConversation}
                    currentAccountId={accountId}
                  />
                ))
              ) : (
                <div className="text-center text-gray-400 mt-10">
                  Không có cuộc hội thoại nào trong tab này
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 bg-gray-50">
            {selectedConversation ? (
              <ChatWindow conversationId={selectedConversation} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-xl font-medium mb-2">Chọn một cuộc hội thoại</p>
                  <p className="text-sm">Bắt đầu trò chuyện với khách hàng, shipper hoặc admin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;