import React from "react";
import dayjs from "dayjs";

const ConversationCard = ({ conversation, isSelected, onClick, currentAccountId }) => {
  const displayTitle =
    currentAccountId === conversation.accountId1
      ? conversation.title2
      : conversation.title1;

  return (
    <div
      onClick={() => onClick(conversation.id)}
      className={`p-4 mb-2 rounded-lg cursor-pointer shadow-md transition-all
        ${
          isSelected
            ? "bg-blue-600 text-white"
            : "bg-gray-100 hover:bg-blue-100 text-gray-900"
        }`}
    >
      <p className="font-semibold truncate">{displayTitle || "No title"}</p>
      <span
        className={`text-sm ${
          isSelected ? "text-white" : "text-gray-500"
        }`}
      >
        {conversation.lastUpdated
          ? dayjs(conversation.lastUpdated).format("YYYY-MM-DD HH:mm")
          : "No activity"}
      </span>
    </div>
  );
};

export default ConversationCard;
