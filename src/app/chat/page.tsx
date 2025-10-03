"use client";

import { streamModelReply } from "@/shared/lib/call-api";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChatColumn } from "./chatcolumn";

export type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  status: string;
  timeTaken?: number;
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const [messagesA, setMessagesA] = useState<Message[]>([]);

  const containerRefA = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const containerRefB = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (containerRefA.current)
      containerRefA.current.scrollTop = containerRefA.current.scrollHeight;
  }, [messagesA]);

  const addMessageA = (
    id: string,
    chunk: string,
    status: string,
    timeTaken?: number
  ) => {
    setMessagesA((m) => {
      const existing = m.find((msg) => msg.id === id);
      if (!existing)
        return [...m, { id, role: "ai", text: chunk, status, timeTaken }];
      return m.map((msg) =>
        msg.id === id
          ? { ...msg, text: msg.text + chunk, status, timeTaken }
          : msg
      );
    });
  };

  const handleSend = async () => {
    if (loading) return;
    const text = input.trim();
    if (!text) return;

    setLoading(true);

    const startTime = Date.now();
    const userId = `u-${Date.now()}`;

    const userMsg: Message = {
      id: userId,
      role: "user",
      text,
      status: "completed",
    };
    setMessagesA((m) => [...m, userMsg]);

    setInput("");
    inputRef.current?.focus();

    const token = await getToken();

    await Promise.all([
      streamModelReply(
        "GPT5",
        text,
        (id, chunk, status) => {
          const elapsed = Date.now() - startTime;
          addMessageA(id, chunk, status, elapsed);
        },
        token ?? ""
      ),
    ]);

    setLoading(false);
  };

  // Auto-resize textarea (basic) - optional improvement
  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px"; // cap height
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex items-stretch justify-center bg-gray-50 px-2 sm:px-4 py-2"
      style={{
        paddingLeft: "max(env(safe-area-inset-left,0),0.5rem)",
        paddingRight: "max(env(safe-area-inset-right,0),0.5rem)",
        paddingTop: "max(env(safe-area-inset-top,0),0.5rem)",
        paddingBottom: "max(env(safe-area-inset-bottom,0),0.5rem)",
      }}
    >
      <div className="flex flex-col flex-1 h-[calc(100dvh-1rem)] sm:h-[90vh] max-h-[100dvh] sm:max-h-[90vh] border border-gray-200 bg-white rounded-xl w-full max-w-5xl overflow-hidden shadow-sm">
        {/* Messages Area */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden gap-3 sm:gap-4 p-2 sm:p-4">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              ref={containerRefA}
              className="flex-1 overflow-y-auto pr-1 space-y-3 scroll-smooth custom-scrollbar"
            >
              <ChatColumn
                model="GPT5"
                messages={messagesA}
                containerRef={containerRefA}
              />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white sticky bottom-0">
          <form
            className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            aria-label="Chat message input form"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !loading) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              aria-label="Message input"
              className="flex-1 resize-none p-3 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm sm:text-base leading-relaxed max-h-60"
              placeholder="Type a message... (Shift+Enter for newline)"
              disabled={loading}
            />
            <div className="flex sm:flex-col items-stretch sm:items-end gap-2">
              <button
                type="submit"
                disabled={loading || input.trim() === ""}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-md font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
                  loading || input.trim() === ""
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white"
                }`}
                aria-disabled={loading || input.trim() === ""}
                aria-label={loading ? "Sending message" : "Send message"}
              >
                {loading ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
