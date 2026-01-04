import React, { useMemo, useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function ChatPanel() {
  // Mock conversations
  const initialChats = useMemo(
    () => [
      {
        id: "c1",
        name: "Roisha Maharjan",
        lastMessage: "I feel anxious today...",
        unread: 2,
        messages: [
          { from: "patient", text: "Hi doctor, I feel anxious today...", time: "10:02" },
          { from: "counselor", text: "I’m here. Tell me what triggered it?", time: "10:03" },
          { from: "patient", text: "I had a bad morning and can't focus.", time: "10:04" },
        ],
      },
      {
        id: "c2",
        name: "Sujan Shrestha",
        lastMessage: "Can we reschedule?",
        unread: 0,
        messages: [
          { from: "patient", text: "Hello, can we reschedule?", time: "09:10" },
          { from: "counselor", text: "Sure. Which day works for you?", time: "09:12" },
        ],
      },
      {
        id: "c3",
        name: "Anu Lama",
        lastMessage: "Thank you for the session!",
        unread: 0,
        messages: [
          { from: "patient", text: "Thank you for the session!", time: "Yesterday" },
          { from: "counselor", text: "You’re welcome. Take care!", time: "Yesterday" },
        ],
      },
    ],
    []
  );

  const [chats, setChats] = useState(initialChats);
  const [activeId, setActiveId] = useState(initialChats[0]?.id || null);

  const activeChat = chats.find((c) => c.id === activeId);

  const handleSelect = (id) => {
    setActiveId(id);
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = (text) => {
    if (!text?.trim() || !activeChat) return;

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChat.id) return c;
        const newMsg = { from: "counselor", text, time: "Now" };
        return {
          ...c,
          lastMessage: text,
          messages: [...c.messages, newMsg],
        };
      })
    );
  };

  return (
    <div className="h-[75vh] md:h-[78vh] grid grid-cols-12">
      <div className="col-span-12 md:col-span-4 border-r">
        <ChatList chats={chats} activeId={activeId} onSelect={handleSelect} />
      </div>
      <div className="col-span-12 md:col-span-8">
        <ChatWindow chat={activeChat} onSend={handleSend} />
      </div>
    </div>
  );
}
