export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [...messages, { role: "user", content: userMessage }],
    }),
  });
  if (!response.ok) throw new Error("Chat request failed");
  const data = await response.json();
  return data.reply;
}
