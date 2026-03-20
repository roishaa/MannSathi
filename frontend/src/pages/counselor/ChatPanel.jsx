import React, { useEffect, useMemo, useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import api from "../../utils/api";

function normalizeChat(item) {
  return {
    id: item.id || item.chat_id || item.room_id,
    sessionId: item.session_id || item.sessionId || null,
    name:
      item.patient_name ||
      item.user_name ||
      item.patient?.name ||
      item.user?.name ||
      "Unknown patient",
    lastMessage:
      item.last_message ||
      item.lastMessage ||
      item.latest_message ||
      "No messages yet",
    unread: Number(item.unread_count || item.unread || 0),
  };
}

function normalizeMessage(item) {
  return {
    id: item.id,
    text: item.text || item.message || "",
    from:
      item.from ||
      item.sender_type ||
      item.sender ||
      (item.is_mine ? "counselor" : "patient"),
    time:
      item.time ||
      item.created_at_label ||
      (item.created_at
        ? new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : ""),
    created_at: item.created_at || null,
  };
}

export default function ChatPanel({ selectedSession }) {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatError, setChatError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sending, setSending] = useState(false);

  const activeChat = useMemo(
    () => chats.find((c) => String(c.id) === String(activeId)) || null,
    [chats, activeId]
  );

  const loadChats = async () => {
    setLoadingChats(true);
    setChatError("");

    try {
      const { data } = await api.get("/counselor/chats");
      const raw = Array.isArray(data) ? data : data?.data || [];
      const normalized = raw.map(normalizeChat);
      setChats(normalized);

      if (!activeId && normalized.length > 0) {
        setActiveId(normalized[0].id);
      }
    } catch (err) {
      setChatError(err?.response?.data?.message || "Failed to load chats.");
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId) => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setMessageError("");

    try {
      const { data } = await api.get(`/counselor/chats/${chatId}/messages`);
      const raw = Array.isArray(data) ? data : data?.data || [];
      setMessages(raw.map(normalizeMessage));
    } catch (err) {
      setMessageError(err?.response?.data?.message || "Failed to load messages.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const openChatFromSession = async (sessionId) => {
    if (!sessionId) return;

    try {
      const existing = chats.find((c) => String(c.sessionId) === String(sessionId));
      if (existing) {
        setActiveId(existing.id);
        return;
      }

      const { data } = await api.post(`/counselor/chats/session/${sessionId}/open`);
      const opened = normalizeChat(data?.data || data);

      setChats((prev) => {
        const already = prev.find((c) => String(c.id) === String(opened.id));
        if (already) return prev;
        return [opened, ...prev];
      });

      setActiveId(opened.id);
    } catch (err) {
      console.error("Open chat from session failed:", err);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId]);

  useEffect(() => {
    if (selectedSession?.id) {
      openChatFromSession(selectedSession.id);
    }
  }, [selectedSession?.id]);

  const handleSelect = (id) => {
    setActiveId(id);
    setChats((prev) =>
      prev.map((c) => (String(c.id) === String(id) ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = async (text) => {
    if (!text?.trim() || !activeChat) return;

    setSending(true);

    try {
      const { data } = await api.post(`/counselor/chats/${activeChat.id}/messages`, {
        message: text,
      });

      const saved = normalizeMessage(data?.data || data || { message: text, from: "counselor" });

      setMessages((prev) => [...prev, saved]);

      setChats((prev) =>
        prev.map((c) =>
          String(c.id) === String(activeChat.id)
            ? { ...c, lastMessage: saved.text || text }
            : c
        )
      );
    } catch (err) {
      setMessageError(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[75vh] md:h-[78vh] grid grid-cols-12">
      <div className="col-span-12 md:col-span-4 border-r">
        <ChatList
          chats={chats}
          activeId={activeId}
          onSelect={handleSelect}
          loading={loadingChats}
          error={chatError}
        />
      </div>

      <div className="col-span-12 md:col-span-8">
        {messageError && (
          <div className="px-4 py-2 text-sm text-red-600 border-b bg-red-50">
            {messageError}
          </div>
        )}

        <ChatWindow
          chat={activeChat}
          messages={messages}
          onSend={handleSend}
          sending={sending}
          loading={loadingMessages}
        />
      </div>
    </div>
  );
}