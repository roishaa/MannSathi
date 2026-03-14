import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, onSelectConversation }) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Conversations</h2>
      <div className="space-y-4">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No conversations yet. Start a new chat!</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center p-4 rounded-xl shadow-sm hover:scale-105 transition-transform cursor-pointer"
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex-shrink-0">
                <LucideIcon name="MessageCircle" className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">{conversation.title}</h3>
                <p className="text-sm text-gray-500">{conversation.lastMessage}</p>
                <span className="text-xs text-gray-400">{conversation.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;