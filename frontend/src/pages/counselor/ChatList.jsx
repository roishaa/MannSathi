import React, { useMemo, useState } from "react";

export default function ChatList({ chats, activeId, onSelect }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return chats;
    return chats.filter((c) => c.name.toLowerCase().includes(s));
  }, [q, chats]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="text-lg font-semibold text-gray-900">Chats</div>
        <div className="text-xs text-gray-500 mt-1">Patients messaging you</div>

        <div className="mt-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patient..."
            className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-[#215C4C]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((c) => {
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={[
                "w-full text-left p-4 border-b hover:bg-gray-50 transition",
                isActive ? "bg-[#FAFBFF]" : "bg-white",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{c.name}</div>
                  <div className="text-xs text-gray-500 truncate">{c.lastMessage}</div>
                </div>
                {c.unread > 0 && (
                  <span className="min-w-[26px] h-6 px-2 rounded-full bg-[#215C4C] text-white text-xs font-bold flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-6 text-sm text-gray-500">No chats found.</div>
        )}
      </div>
    </div>
  );
}
