import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const ChatWindow = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(null);

  const messagesContainerRef = useRef(null);
  const stompClientRef = useRef(null);

  const accountId = localStorage.getItem("accountId");

  /* ===================== LOAD CONVERSATION & HISTORY ===================== */
  useEffect(() => {
    if (!conversationId) return;

    const fetchData = async () => {
      try {
        const [convRes, msgRes] = await Promise.all([
          axios.get(
            `http://localhost:8083/api/conversation/info?conversationId=${conversationId}`
          ),
          axios.get(
            `http://localhost:8083/api/message/fetch?conversationId=${conversationId}`
          ),
        ]);

        setConversation(convRes.data);
        setMessages(msgRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, [conversationId]);

  /* ===================== AUTO SCROLL ===================== */
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  /* ===================== WEBSOCKET ===================== */
  useEffect(() => {
    if (!conversationId) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS("http://localhost:8083/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket");

        client.subscribe(
          `/topic/conversation/${conversationId}`,
          (message) => {
            if (message.body) {
              const newMsg = JSON.parse(message.body);
              setMessages((prev) => [...prev, newMsg]);
            }
          }
        );
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [conversationId]);

  /* ===================== SEND MESSAGE ===================== */
  const handleSend = async () => {
    if (!input.trim() || !conversation) return;

    const userMessage = {
      conversationId,
      content: input,
      sender: accountId,
    };

    try {
      await axios.post(
        "http://localhost:8083/api/message/send",
        userMessage
      );
      setInput("");

      if (conversation.channelType === "Chatbot") {
        const chatbotRes = await axios.post(
          "http://localhost:8083/api/chatbot",
          {},
          { params: { message: input } }
        );

        const botMessage = {
          conversationId,
          content: chatbotRes.data,
          sender: "CHATBOT",
        };

        await axios.post(
          "http://localhost:8083/api/message/send",
          botMessage
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-3"
      >
        {[...messages]
          .sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          )
          .map((msg, idx) => (
            <MessageBubble
              key={idx}
              {...msg}
              accountId={accountId}
            />
          ))}
      </div>

      {/* Input */}
      <div className="flex items-center border rounded-full px-3 py-2">
        <input
          type="text"
          className="flex-1 outline-none"
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
