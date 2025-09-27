import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWindow from "./Components/ChatWindow";
import ConversationCard from "./Components/ConversationCard";

const ChatbotPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const accountId = localStorage.getItem("accountId");

  useEffect(() => {
    axios
      .get(`http://localhost:8083/api/conversation/fetch?userId=${accountId}`)
      .then((res) => setConversations(res.data))
      .catch((err) => console.error(err));
  }, [accountId]);

  const handleNewConversation = async () => {
    try {
      const conversation = {
        id: null,
        userId: accountId,
        createdAt: null,
        lastUpdated: null,
      };

      const res = await axios.post(
        "http://localhost:8083/api/conversation/create",
        conversation
      );

      const newConv = { ...res.data, name: res.data.id };
      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversation(newConv.id);
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  };

  const handleSelectConversation = (id) => {
    setSelectedConversation(id);
    console.log("Selected conversation:", id);
  };

  return (
    <div className="flex h-[80vh]">
      <div className="w-1/4 border-r p-3">
        <button
          onClick={handleNewConversation}
          className="w-full mb-3 py-2 px-4 rounded-xl bg-gray-200 hover:bg-gray-300"
        >
          + Create new conversation
        </button>

        {conversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedConversation === conversation.id}
            onClick={handleSelectConversation}
          />
        ))}
      </div>

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

export default ChatbotPage;