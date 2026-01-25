import React, { useMemo, useState } from "react";

export default function ChatWindow({ chat, onSend }) {
  const [text, setText] = useState("");

  const messages = useMemo(() => chat?.messages || [], [chat]);

  const send = () => {
    if (!text.trim() || !chat) return;
    onSend?.(text.trim());
    setText("");
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="font-semibold text-gray-900">{chat ? chat.name : "Select a chat"}</div>
        <div className="text-xs text-gray-500">
          {chat ? "Chat with patient" : "Choose a conversation from the left."}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFF]">
        {!chat && <div className="text-sm text-gray-500">No chat selected.</div>}

        {messages.map((m, idx) => {
          const mine = m.from === "counselor";
          return (
            <div key={idx} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={[
                  "max-w-[80%] rounded-2xl px-4 py-2 border",
                  mine ? "bg-[#215C4C] text-white border-[#215C4C]" : "bg-white text-gray-900",
                ].join(" ")}
              >
                <div className="text-sm leading-relaxed">{m.text}</div>
                <div className={`text-[10px] mt-1 ${mine ? "text-white/80" : "text-gray-500"}`}>
                  {m.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={chat ? "Type a message..." : "Select a chat to start..."}
            disabled={!chat}
            className="flex-1 px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-[#215C4C] disabled:bg-gray-50"
          />
          <button
            onClick={send}
            disabled={!chat || !text.trim()}
            className="px-5 py-3 rounded-2xl bg-[#215C4C] text-white font-semibold disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
