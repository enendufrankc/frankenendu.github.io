import { useState, useEffect, useRef } from "react";
import { sendMessage, type ChatMessage } from "../lib/chatbot";

type LeadCapture = {
  email: string;
  whatsapp: string;
  summary: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi — I'm the Inflect Hub Discovery Agent. Tell me about your business and what's prompting you to look into AI right now.",
};

const STORAGE_KEY = "inflect:chat-state";
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000;

type PersistedState = {
  messages: ChatMessage[];
  savedAt: number;
};

function loadPersisted(): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (Date.now() - parsed.savedAt > STORAGE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.messages;
  } catch {
    return null;
  }
}

function persist(messages: ChatMessage[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ messages, savedAt: Date.now() } as PersistedState)
    );
  } catch {
    /* localStorage unavailable — ignore */
  }
}

const SERVICE_OPENERS: Record<string, string> = {
  "custom-platforms":
    "Hi — I'm the Inflect Hub Discovery Agent. You're here from the Custom AI Platforms section. Tell me about your business and the specific problem you're trying to put a custom AI platform around.",
  "conversational-ai":
    "Hi — I'm the Inflect Hub Discovery Agent. You're here from the Conversational AI section. Tell me about your business and the channel where your customers spend their time.",
  personalisation:
    "Hi — I'm the Inflect Hub Discovery Agent. You're here from the Personalisation Funnels section. Tell me about your business and the moment in your customer journey where guidance breaks down.",
  "multi-modal-content":
    "Hi — I'm the Inflect Hub Discovery Agent. You're here from the Multi-Modal Content section. Tell me about your brand and the content cadence you're trying to maintain.",
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => loadPersisted() ?? [INITIAL_MESSAGE]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [lead, setLead] = useState<LeadCapture>({ email: "", whatsapp: "", summary: "" });
  const [captureStatus, setCaptureStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist messages whenever they change
  useEffect(() => {
    persist(messages);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Listen for global open events from CTAs across the site
  useEffect(() => {
    function handleOpen(e: Event) {
      const detail = (e as CustomEvent<{ service?: string | null }>).detail;
      const serviceSlug = detail?.service;
      // If a service opener exists and the current conversation is fresh, seed it
      if (serviceSlug && SERVICE_OPENERS[serviceSlug] && messages.length === 1) {
        setMessages([{ role: "assistant", content: SERVICE_OPENERS[serviceSlug] }]);
      }
      setIsOpen(true);
    }
    window.addEventListener("inflect:open-chat", handleOpen);
    return () => window.removeEventListener("inflect:open-chat", handleOpen);
  }, [messages.length]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const conversationHistory = messages.slice(1);

    try {
      const reply = await sendMessage(conversationHistory, trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // If the reply mentions capturing the lead (signal phrase from the prompt), surface the capture UI
      const lower = reply.toLowerCase();
      if (
        lower.includes("send frank a short summary") ||
        lower.includes("what email should he reply to") ||
        lower.includes("frank will be in touch")
      ) {
        // Auto-summarise the conversation for the lead
        const summary = messages
          .filter((m) => m.role === "user")
          .map((m) => m.content)
          .join("\n\n");
        setLead((prev) => ({ ...prev, summary }));
        setShowCapture(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Try again, or email frank@inflecthub.com directly and we'll pick up there.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCaptureSubmit() {
    if (!lead.email.trim() || !lead.summary.trim()) return;
    setCaptureStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!res.ok) {
        setCaptureStatus("error");
        return;
      }
      setCaptureStatus("sent");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sent. Frank will be in touch within one business day.",
        },
      ]);
      setTimeout(() => setShowCapture(false), 1500);
    } catch {
      setCaptureStatus("error");
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
          aria-label="Inflect Hub Discovery Agent"
          style={{
            position: "fixed",
            bottom: "5rem",
            right: "1.5rem",
            width: "min(420px, calc(100vw - 2rem))",
            height: "min(560px, calc(100vh - 8rem))",
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
                Inflect Hub · Discovery Agent
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
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
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

          {/* Input */}
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
              placeholder="Tell me about your business..."
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
              }}
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
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>

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
              Inflect Hub · Powered by Gemini
            </span>
          </div>

          {showCapture && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--bg-secondary)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1rem" }}>
                  Send Frank a summary
                </h3>
                <button
                  onClick={() => setShowCapture(false)}
                  aria-label="Cancel"
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Email (required)
                <input
                  type="email"
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    marginTop: "0.25rem",
                    padding: "0.5rem",
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                />
              </label>

              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                WhatsApp (optional)
                <input
                  type="tel"
                  value={lead.whatsapp}
                  onChange={(e) => setLead({ ...lead, whatsapp: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: "0.25rem",
                    padding: "0.5rem",
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                />
              </label>

              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", flex: 1 }}>
                Summary (editable)
                <textarea
                  value={lead.summary}
                  onChange={(e) => setLead({ ...lead, summary: e.target.value })}
                  rows={6}
                  style={{
                    width: "100%",
                    marginTop: "0.25rem",
                    padding: "0.5rem",
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-body)",
                    resize: "vertical",
                  }}
                />
              </label>

              <button
                onClick={handleCaptureSubmit}
                disabled={!lead.email.trim() || !lead.summary.trim() || captureStatus === "sending"}
                style={{
                  padding: "0.625rem 1rem",
                  background: "#e94560",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {captureStatus === "sending"
                  ? "Sending..."
                  : captureStatus === "sent"
                  ? "Sent ✓"
                  : captureStatus === "error"
                  ? "Try again"
                  : "Send to Frank"}
              </button>
              {captureStatus === "error" && (
                <p style={{ fontSize: "0.75rem", color: "#e94560", margin: 0 }}>
                  Couldn't send. Email frank@inflecthub.com directly.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open Inflect Hub Discovery Agent"}
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
        }}
      >
        <span style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>
          {isOpen ? "+" : "💬"}
        </span>
      </button>
    </>
  );
}
