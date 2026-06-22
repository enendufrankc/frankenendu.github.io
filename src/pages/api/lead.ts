import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const RECIPIENT = "enendufrank24@gmail.com";
const FROM = "Inflect Hub <onboarding@resend.dev>"; // TODO change to frank@inflecthub.com after DNS

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; whatsapp?: string; summary?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, whatsapp, summary } = body;

  if (!email || !summary) {
    return new Response(
      JSON.stringify({ ok: false, error: "email and summary are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev fallback — log to console, don't actually email
    console.warn("[lead] RESEND_API_KEY not set; lead captured to console only:");
    console.warn({ email, whatsapp, summary });
    return new Response(
      JSON.stringify({ ok: true, dev: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const resend = new Resend(apiKey);
  const subject = `New Inflect Hub lead: ${email}`;
  const text = [
    `New discovery-agent lead from inflecthub.com`,
    ``,
    `From: ${email}`,
    `WhatsApp: ${whatsapp || "(not provided)"}`,
    ``,
    `Summary:`,
    summary,
    ``,
    `Reply directly to this email — it routes to the prospect.`,
  ].join("\n");

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: RECIPIENT,
      replyTo: email,
      subject,
      text,
    });
    if (result.error) {
      console.error("[lead] resend error:", result.error);
      return new Response(
        JSON.stringify({ ok: false, error: "Failed to send" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ ok: true, id: result.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[lead] unexpected error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
