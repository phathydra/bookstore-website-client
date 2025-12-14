import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWindow from "./components/ChatWindow";
import ConversationCard from "./components/ConversationCard";

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("");

  const accountId = localStorage.getItem("accountId");

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

  useEffect(() => {
    fetchUserRole();
    fetchConversations();
  }, [accountId]);

  const tabs =
    role === "Shipper"
      ? ["Customer", "Delivery unit", "Admin"]
      : role === "DeliveryUnit"
      ? ["Customer", "Shipper", "Admin"]
      : ["Customer", "Admin"];

  useEffect(() => {
    if (role && !activeTab) {
      setActiveTab(tabs[0]);
    }
  }, [role]);

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

  return (
    <div className="flex h-[80vh]">
      {/* Sidebar */}
      <div className="w-1/4 border-r p-3 flex flex-col">
        {/* Tabs */}
        <div className="flex mb-3 space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Nút tạo mới chỉ cho Admin */}
        {activeTab === "Admin" && (
          <button
            onClick={handleNewConversation}
            className="w-full mb-3 py-2 px-4 rounded-xl bg-gray-200 hover:bg-gray-300"
          >
            + Create new conversation
          </button>
        )}

        {/* Danh sách conversation */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-center text-gray-400 mt-5">Loading...</div>
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
            <div className="text-center text-gray-400 mt-5">
              No conversations in this tab
            </div>
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow conversationId={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
