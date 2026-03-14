import React from 'react';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs p-4 rounded-2xl shadow-md transition-transform duration-200 ease-in-out ${
          isUser ? 'bg-soft-blue text-white' : 'bg-lavender text-black'
        } hover:scale-105`}
      >
        {message}
      </div>
    </div>
  );
};

export default MessageBubble;