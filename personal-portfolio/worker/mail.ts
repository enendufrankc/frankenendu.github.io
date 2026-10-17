import type { DiaryEnv } from './types';

// The caller decides whether a failed delivery is visible (invitation) or generic
// (authentication). Never include provider responses or mail contents in logs.
export async function sendMail(env: DiaryEnv, email: string, subject: string, text: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.DIARY_FROM_EMAIL, to: [email], subject, text }),
      signal: AbortSignal.timeout(10000),
    });
    await response.body?.cancel();
    return response.ok;
  } catch { return false; }
}
