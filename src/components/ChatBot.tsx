import { useState, useEffect, useRef } from "react";
import { sendMessage, type ChatMessage } from "../lib/chatbot";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm Frank's AI assistant. Ask me anything about his experience, projects, or skills.",
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Exclude the initial greeting from the API call
    const conversationHistory = messages.slice(1);

    try {
      const reply = await sendMessage(conversationHistory, trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again or contact Frank directly at enendufrankc@gmail.com.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with Frank's AI assistant"
          style={{
            position: "fixed",
            bottom: "5rem",
            right: "1.5rem",
            width: "min(400px, calc(100vw - 2rem))",
            height: "min(500px, calc(100vh - 8rem))",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(233, 69, 96, 0.15)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-tertiary)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                }}
              >
                Ask me about Frank
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-secondary)",
                fontSize: "1.1rem",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLButtonElement).style.color =
                  "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLButtonElement).style.color =
                  "var(--text-secondary)")
              }
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "0.625rem 0.875rem",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.role === "user" ? "#e94560" : "var(--bg-tertiary)",
                    color:
                      msg.role === "user" ? "#ffffff" : "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    lineHeight: 1.55,
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "0.625rem 0.875rem",
                    borderRadius: "16px 16px 16px 4px",
                    background: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    fontStyle: "italic",
                  }}
                >
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              background: "var(--bg-secondary)",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Frank's work..."
              disabled={isLoading}
              aria-label="Chat message input"
              style={{
                flex: 1,
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color var(--transition-fast)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--accent)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border)")
              }
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "none",
                background:
                  isLoading || !input.trim() ? "var(--bg-tertiary)" : "#e94560",
                color:
                  isLoading || !input.trim()
                    ? "var(--text-muted)"
                    : "#ffffff",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                transition: "all var(--transition-fast)",
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "0.4rem 1rem",
              textAlign: "center",
              borderTop: "1px solid var(--border)",
              background: "var(--bg-secondary)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Powered by Gemini
            </span>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat with Frank's AI assistant"}
        aria-expanded={isOpen}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: "#e94560",
          color: "#ffffff",
          fontSize: "1.4rem",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(233, 69, 96, 0.5)",
          transition: "transform var(--transition-normal), box-shadow var(--transition-normal)",
          transform: isOpen ? "scale(0.95)" : "scale(1)",
        }}
        onMouseEnter={(e) => {
          if (!isOpen)
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = isOpen
            ? "scale(0.95)"
            : "scale(1)";
        }}
      >
        <span
          style={{
            display: "inline-block",
            transition: "transform var(--transition-normal)",
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          {isOpen ? "+" : "💬"}
        </span>
      </button>
    </>
  );
}
