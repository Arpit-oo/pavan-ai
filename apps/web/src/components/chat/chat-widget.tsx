"use client";

import { useState, useRef, useEffect } from "react";
import { fetchAPI } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "why is anand vihar so polluted?",
  "what should delhi do right now?",
  "which intervention helps most?",
  "is it safe to go outside today?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "hey! i'm pavan — your air quality intelligence assistant. ask me anything about delhi's air quality, pollution sources, or what interventions could help.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Try Next.js API route first (works on Vercel), fall back to backend
      let response = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg.content }),
        });
        const data = await res.json();
        response = data.response;
      } catch {
        const res = await fetchAPI<{ response: string }>("/api/v1/agents/ask", {
          method: "POST",
          body: JSON.stringify({ query: userMsg.content, city: "Delhi" }),
        });
        response = res.response;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "check the dashboard for live aqi data across 105 stations in 57 cities. the map shows everything — zoom into any city for detail.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-fab"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <img src="/claudy/pray.png" alt="Claudy" className="w-9 h-9 rounded-full object-cover bg-secondary" style={{ objectPosition: "center 20%" }} />
              <div>
                <p className="text-[13px]" style={{ fontVariationSettings: "'wght' 620" }}>pavan assistant</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">air quality intelligence</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 ping-dot" />
                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">live</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[420px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}
                  style={{ fontSize: "15px", lineHeight: "1.6" }}
                >
                  {msg.content.split("\n").map((line, j) => (
                    <span key={j}>
                      {line.split("**").map((part, k) =>
                        k % 2 === 1 ? (
                          <strong key={k} style={{ fontVariationSettings: "'wght' 680" }}>{part}</strong>
                        ) : (
                          <span key={k}>{part}</span>
                        )
                      )}
                      {j < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions — only show at start */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="text-[11px] bg-secondary hover:bg-accent text-foreground px-2.5 py-1.5 rounded-full transition-colors lowercase"
                    style={{ fontVariationSettings: "'wght' 480" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="ask about air quality..."
                className="flex-1 bg-secondary rounded-full px-4 py-2 text-[13px] outline-none placeholder:text-muted-foreground/50"
                style={{ fontVariationSettings: "'wght' 440" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
