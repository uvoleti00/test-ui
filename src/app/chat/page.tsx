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

  const containerRefA = useRef<HTMLDivElement>( null ) as React.RefObject<HTMLDivElement>; 
  const containerRefB = useRef<HTMLDivElement>( null ) as React.RefObject<HTMLDivElement>; 
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (containerRefA.current) containerRefA.current.scrollTop = containerRefA.current.scrollHeight;
  }, [messagesA]);


  const addMessageA = (id: string, chunk: string, status: string, timeTaken?: number) => {
    setMessagesA((m) => {
      const existing = m.find((msg) => msg.id === id);
      if (!existing) return [...m, { id, role: "ai", text: chunk, status, timeTaken }];
      return m.map((msg) =>
        msg.id === id ? { ...msg, text: msg.text + chunk, status, timeTaken } : msg
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

    const userMsg: Message = { id: userId, role: "user", text, status: "completed" };
    setMessagesA((m) => [...m, userMsg]);
  

    setInput("");
    inputRef.current?.focus();

    const token = await getToken();


    await Promise.all([
      streamModelReply("GPT5", text, (id, chunk, status) => {
        const elapsed = Date.now() - startTime;
        addMessageA(id, chunk, status, elapsed);
      }, token ?? "")
    ]);

    setLoading(false);
  };

  return (
    <div className="h-[90vh] flex items-center justify-center">
      <div className="flex flex-col h-full max-h-screen border border-gray-200 bg-white rounded-xl w-full max-w-5xl overflow-hidden">
        <div className="flex flex-row flex-1 overflow-hidden gap-2">
          <ChatColumn model="GPT5" messages={messagesA} containerRef={containerRefA} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <form
            className="flex gap-3 items-end"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !loading) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 resize-none p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Type a message... (Shift+Enter for newline)"
            />
            <button
              type="submit"
              disabled={loading || input.trim() === ""}
              className={`px-4 py-2 rounded-md ${
                loading || input.trim() === "" ? "bg-gray-300 text-gray-600 cursor-progress" : "bg-indigo-600 text-white cursor-pointer"
              }`}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
