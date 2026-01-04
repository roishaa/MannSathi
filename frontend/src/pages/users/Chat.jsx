import React from "react";
import { Link } from "react-router-dom";

export default function Chat() {
  return (
    <div className="min-h-screen bg-[#f8f6f0] px-5 md:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard" className="text-sm underline text-[#1f4e43]">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
        <h1 className="text-xl font-semibold text-[#1e293b]">Chat Support</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Chat UI placeholder. Later connect to Pusher / WebSocket.
        </p>

        <div className="mt-5 rounded-3xl border border-[#e5e7eb] bg-[#f9fafb] p-4 h-[420px] flex flex-col">
          <div className="text-xs text-[#6b7280] text-center">
            Messages will appear here.
          </div>

          <div className="mt-auto flex gap-2">
            <input
              className="flex-1 rounded-2xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none"
              placeholder="Type a message..."
            />
            <button className="rounded-2xl bg-[#1f4e43] text-white px-5 text-sm font-semibold">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
