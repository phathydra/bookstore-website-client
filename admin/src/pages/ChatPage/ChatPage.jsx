import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWindow from "./components/ChatWindow";
import ConversationCard from "./components/ConversationCard";

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeTab, setActiveTab] = useState("Request");

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

        {/* Danh sách conversation */}
        <div className="overflow-y-auto flex-1">
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