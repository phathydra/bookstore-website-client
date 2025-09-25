import React from "react";
import dayjs from "dayjs";

const MessageBubble = ({ sender, content, createdAt }) => {
  const isUser = sender === "USER";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-xs p-3 rounded-xl shadow 
          ${isUser ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}
      >
        <div className="text-sm" dangerouslySetInnerHTML={{ __html: content }} />
        <p className={`text-xs mt-1 text-right ${isUser?"text-white":"text-gray-500"}`}>
          {dayjs(createdAt).format("YYYY-MM-DD HH:mm")}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;