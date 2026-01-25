import React from "react";

export default function ChatList({ chats = [], activeId, onSelect }) {
  return (
    <div className="h-full bg-white">
      <div className="p-4 border-b">
        <div className="text-lg font-semibold text-gray-900">Chats</div>
        <div className="text-xs text-gray-500">Patients</div>
      </div>

      <div className="overflow-y-auto h-[calc(75vh-73px)] md:h-[calc(78vh-73px)]">
        {chats.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect?.(c.id)}
              className={[
                "w-full text-left p-4 border-b hover:bg-gray-50 transition",
                active ? "bg-[#F7F8FC]" : "bg-white",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{c.name}</div>
                  <div className="text-xs text-gray-500 truncate">{c.lastMessage}</div>
                </div>

                {c.unread > 0 && (
                  <span className="min-w-[24px] h-6 px-2 rounded-full bg-[#215C4C] text-white text-xs font-bold flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {chats.length === 0 && <div className="p-6 text-sm text-gray-500">No chats yet.</div>}
      </div>
    </div>
  );
}
