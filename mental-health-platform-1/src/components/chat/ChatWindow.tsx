import React from 'react';
import { MessageBubble } from './MessageBubble';

const ChatWindow = ({ messages, onSendMessage, user }) => {
    const [inputValue, setInputValue] = React.useState('');

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col h-full p-6 bg-white rounded-2xl shadow-md">
            <div className="flex-1 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} user={user} />
                ))}
            </div>
            <div className="flex items-center mt-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                    onClick={handleSend}
                    className="ml-3 px-4 py-2 text-white bg-blue-500 rounded-xl shadow-md hover:scale-105 transition-transform"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;