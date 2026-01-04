    import React, { useEffect, useRef, useState } from "react";

export default function ChatWindow({ chat, onSend }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length, chat?.id]);

  const submit = (e) => {
    e.preventDefault();
    onSend(text);
    setText("");
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a chat to start.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{chat.name}</div>
          <div className="text-xs text-gray-500">Confidential conversation</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
            title="Later: connect to video (Jitsi)"
          >
            Video
          </button>
          <button className="px-3 py-2 rounded-xl bg-[#215C4C] text-white text-xs font-semibold hover:opacity-95">
            Notes
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#F7F8FC]">
        <div className="space-y-3">
          {chat.messages.map((m, idx) => {
            const mine = m.from === "counselor";
            return (
              <div key={idx} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={[
                    "max-w-[78%] rounded-2xl px-4 py-3 border",
                    mine ? "bg-[#215C4C] text-white border-[#215C4C]" : "bg-white text-gray-900",
                  ].join(" ")}
                >
                  <div className="text-sm leading-relaxed">{m.text}</div>
                  <div className={`text-[10px] mt-1 ${mine ? "text-white/80" : "text-gray-400"}`}>
                    {m.time}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={submit} className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-[#215C4C]"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-[#215C4C] text-white font-semibold hover:opacity-95"
          >
            Send
          </button>
        </div>
        <div className="text-[11px] text-gray-500 mt-2">
          (UI only) Later you’ll connect this to Pusher/WebSockets + backend messages table.
        </div>
      </form>
    </div>
  );
}
