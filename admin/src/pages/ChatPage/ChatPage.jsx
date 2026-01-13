import React, { useState, useEffect } from "react";
import axios from "axios";
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import ChatWindow from "./components/ChatWindow";
import ConversationCard from "./components/ConversationCard";

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeTab, setActiveTab] = useState("Request");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const accountId = localStorage.getItem("accountId");
  const tabs = ["Request", "User"];

  useEffect(() => {
    if (!accountId) return;
    axios
      .get(`http://localhost:8083/api/conversation/fetch-admin?accountId=${accountId}`)
      .then((res) => setConversations(res.data))
      .catch((err) => console.error("Error fetching conversations:", err));
  }, [accountId]);

  const filteredConversations = conversations.filter((conv) => {
    if (activeTab === "Request") {
      return conv.channelType === "Admin" && conv.accountId1 === "Admin";
    }
    return !(conv.channelType === "Admin" && conv.accountId1 === "Admin");
  });

  const handleSelectConversation = (id) => {
    setSelectedConversation(id);
  };

  const handleToggleMenu = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav onToggleCollapse={handleToggleMenu} />

      <main
        className="flex-1 flex flex-col transition-all duration-300 overflow-hidden"
        style={{ paddingLeft: isCollapsed ? '5%' : '16.5%' }}
      >
        <Header
          title="TIN NHẮN"
          isCollapsed={isCollapsed}
          className="sticky top-0 z-50 bg-white shadow-md"
        />

        <div className="flex-1 flex flex-col pt-20 px-4 overflow-hidden">
          <div className="flex h-full rounded-xl shadow-lg bg-white overflow-hidden border">
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

              <div className="flex-1 overflow-y-auto p-3">
                {filteredConversations.length > 0 ? (
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

            <div className="flex-1 bg-gray-50">
              {selectedConversation ? (
                <ChatWindow conversationId={selectedConversation} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-xl font-medium mb-2">Chọn một cuộc hội thoại</p>
                    <p className="text-sm">Bắt đầu trò chuyện với người dùng hoặc yêu cầu từ hệ thống</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;