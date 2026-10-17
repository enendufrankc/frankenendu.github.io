# Inside the Work — invited-reader diary

Approved direction: Frank asked to proceed on 17 October 2026. The diary belongs to his personal portfolio at `https://frankenendu.link/diary/`, for recruiters and other individually invited external readers. Default access lasts seven days from grant, with a custom expiry, extension, and immediate revocation. This is not an Inflect Hub feature.

## Existing application

The production personal portfolio is the separate `personal-portfolio/` Astro app on `feat/personal-portfolio`, deployed as Cloudflare Worker `frank-enendu-portfolio`. The repository root is Inflect Hub. Preserve the root application and both existing checkouts. Work on `feat/gated-diary`, branched from main then advanced to the existing personal-portfolio commit. The GitHub Pages mirror stays static and links readers to the canonical diary on frankenendu.link.

## Reader experience

Add Diary to navigation and an editorial invitation beneath the homepage R&D section. Use the existing Newsreader/DM Sans typography, warm paper background, blue accent, fine rules, and restrained spacing. `/diary/` explains the journal, shows only explicitly approved public teasers, and offers email verification. There is no public registration. `/diary/YYYY-MM/` is an entry route; unauthenticated readers see the sign-in shell, never entry content. Invited readers see the archive and published entries, reading time, topics, attachments, and access expiry. An expired/revoked session loses API access immediately. The interface clears private content when expiry is reached and rechecks on return to the tab.

## Owner experience

`/diary/admin/` is an owner-only workspace with the same email verification flow. Owner email is a server-side configuration value. The owner can create a monthly Markdown draft, preview it, edit its title/summary/topics, explicitly opt into a separate public teaser, publish/unpublish, and upload private PNG/JPEG/WebP/PDF attachments. No destructive entry deletion is needed. Invitations hold email, optional reader name, exact expiry, and revocation status. Creating an invitation sends a plain invitation email; sign-in codes are requested separately. Extend/revoke operations are immediately effective for existing sessions. Do not send real invitations during development.

## Storage and delivery

Keep Astro's public site static. Add a Cloudflare Worker gateway for `/api/diary/*` and diary routes, backed by D1 for entries, invitations, challenges, sessions, attachment metadata and rate limits. R2 stores attachments with no public bucket URL. Private content is never committed to this public repository or included in either static build. An ignored local content directory can hold import drafts; the live editor saves to D1.

Use Resend's HTTPS API for mail with a server-side key and verified sender. No credentials in source, bundles, output or logs. Development tests mock mail and use local D1/R2. Missing production configuration fails closed with a clear unavailable state; no shared password or development bypass.

## Access rules

- Send 8-digit codes generated using Web Crypto, valid for 10 minutes and at most five attempts. Bind each challenge to its email, challenge ID, and initiating browser cookie; consume once atomically. Generic request responses avoid disclosing the invite list. Rate-limit by IP and normalised email.
- Sessions use random 256-bit opaque tokens; store only hashes. Cookies are HttpOnly, Secure on HTTPS, SameSite=Lax, Path=/. Sessions expire no later than the invitation and at most seven days; owner sessions last eight hours.
- Check the current D1 invitation on every protected request. Revoked access cannot be restored accidentally by extending an old session; new invitations invalidate earlier sessions/challenges.
- All mutations require the configured exact origin and suitable request content type. No permissive CORS. Bound body sizes and validate fields, months, dates and content types. Authorisation is enforced by role, not URL secrecy.
- All API/private responses use `Cache-Control: private, no-store`, `Vary: Cookie`, `X-Robots-Tag: noindex, nofollow`, and `X-Content-Type-Options: nosniff`. No private titles in Open Graph or sitemap. Attachment access also checks the parent entry is published for readers.
- Render Markdown using micromark's default safe settings: raw HTML and dangerous protocols disabled. Private image URLs are same-origin authenticated attachment routes. Disable external Markdown images to avoid third-party reader tracking.
- Expiry cannot retract material a reader already copied. Only externally shareable writing belongs in published entries.

## Monthly editorial workflow

Capture notes privately throughout the month; assemble dated evidence; write a draft; review personal contribution, attribution and external suitability; publish. Each month covers context, personal contribution, team context, one decision/experiment, evidence and limitations, lessons, and next intentions. October starts as a private draft with an explicit 17 October evidence cutoff, not a completed-month report. No raw handoffs, internal links, budgets, transcripts or unverified outcome claims enter the public build.

## Verification and release

Test uninvited/wrong-email/expired-code/replayed-code access, email and IP rate limits, cookie flags, CSRF, owner/reader separation, invitation expiry/revocation/extension, draft isolation, private attachments and Markdown injection. Use the local Workers runtime and mocked email. Build and check both portfolio targets, verify protected content is absent, inspect desktop/mobile in a browser, and dry-run the Worker bundle. Provision only the personal account's dedicated diary resources if deployment access is available. No main merge, Inflect Hub deployment, live model calls or external reader invitations. Report any remaining mail/domain setup explicitly.
