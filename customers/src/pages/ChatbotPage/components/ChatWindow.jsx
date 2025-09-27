import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef(null); // ref cho container

  // Load messages of selected conversation
  useEffect(() => {
    if (conversationId) {
      axios
        .get(
          `http://localhost:8083/api/message/fecth?conversationId=${conversationId}`
        )
        .then((res) => setMessages(res.data))
        .catch((err) => console.error(err));
    }
  }, [conversationId]);

  // Auto scroll xuống cuối khi messages thay đổi
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      conversationId,
      content: input,
      sender: "USER",
      createdAt: new Date(),
    };

    // 1. Store user message
    await axios.post("http://localhost:8083/api/message/send", userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // 2. Get chatbot response
    const chatbotRes = await axios.post(
      "http://localhost:8083/api/chatbot",
      {},
      { params: { message: input } }
    );

    const botMessage = {
      conversationId,
      content: chatbotRes.data,
      sender: "CHATBOT",
      createdAt: new Date(),
    };

    // 3. Store chatbot message
    await axios.post("http://localhost:8083/api/message/send", botMessage);
    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-3"
      >
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} {...msg} />
        ))}
      </div>

      <div className="flex items-center border rounded-full px-3 py-2">
        <input
          type="text"
          className="flex-1 outline-none"
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-1 rounded-full bg-blue-500 text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
