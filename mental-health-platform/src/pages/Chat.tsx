import React from 'react';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';

const Chat = () => {
    return (
        <div className="flex h-screen bg-lavender">
            <div className="w-1/3 p-6 shadow-md rounded-2xl bg-white">
                <h2 className="text-xl font-semibold mb-4">Conversations</h2>
                <ConversationList />
            </div>
            <div className="flex-1 p-6 shadow-md rounded-2xl bg-white ml-6">
                <h2 className="text-xl font-semibold mb-4">Chat</h2>
                <ChatWindow />
            </div>
        </div>
    );
};

export default Chat;