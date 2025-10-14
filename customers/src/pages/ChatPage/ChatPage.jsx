import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWindow from "./Components/ChatWindow";
import ConversationCard from "./Components/ConversationCard";

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeTab, setActiveTab] = useState("Chatbot");
  const [isLoading, setIsLoading] = useState(true);

  const accountId = localStorage.getItem("accountId");
  const tabs = ["Chatbot", "Delivery unit", "Shipper", "Admin"];

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
    fetchConversations();
  }, [accountId]);

  useEffect(() => {
    if (!accountId || isLoading) return;

    const hasChatbotChannel = conversations.some(
      (conv) =>
        conv.channelType === "Chatbot" &&
        (conv.accountId1 === accountId || conv.accountId2 === accountId)
    );

    if (!hasChatbotChannel) {
      const newConversation = {
        accountId1: "CHATBOT",
        accountId2: accountId,
        title1: "Chatbot",
        title2: null,
        channelType: "Chatbot",
      };

      axios
        .post("http://localhost:8083/api/conversation/create", newConversation)
        .then((res) => {
          setConversations((prev) => [...prev, res.data]);
        })
        .catch((err) =>
          console.error("Error creating chatbot conversation:", err)
        );
    }
  }, [accountId, conversations, isLoading]);

  const filteredConversations = conversations.filter(
    (conv) => conv.channelType === activeTab
  );

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