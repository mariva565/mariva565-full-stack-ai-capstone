# Security Environment And Secrets Inventory

This document is the production readiness source of truth for which runtime values belong in the frontend, in hosting config, or in Supabase Edge Function secrets.

## 1) Frontend Public Runtime Contract
| Variable | Owner system | Used by | Classification | Notes |
| --- | --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Local `.env`, Netlify env, Vercel env | `src/services/supabaseClient.js` | public runtime config | Required by the browser client. |
| `VITE_SUPABASE_ANON_KEY` | Local `.env`, Netlify env, Vercel env | `src/services/supabaseClient.js` | public client key | Safe for frontend use because access is restricted by RLS and auth rules. |

## 2) Supabase Runtime Values Provided To Edge Functions
| Variable | Owner system | Used by | Classification | Notes |
| --- | --- | --- | --- | --- |
| `SUPABASE_URL` | Supabase hosted function runtime | `chat-with-ai`, `create-user`, `update-user`, `delete-user`, `send-share-note-email` | server runtime config | Read inside functions, not by browser code. |
| `SUPABASE_ANON_KEY` | Supabase hosted function runtime | `chat-with-ai`, `create-user`, `update-user`, `delete-user`, `send-share-note-email` | server runtime config | Public key, but consumed server-side in Edge Functions. |

## 3) Server-Only Secrets And Operational Config
| Variable | Owner system | Used by | Secret | Notes |
| --- | --- | --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase function secrets | `create-user`, `update-user`, `delete-user` | yes | Used only for admin-level user management. |
| `GEMINI_API_KEY` | Supabase function secrets | `chat-with-ai` | yes | AI provider key must never reach frontend code. |
| `RESEND_API_KEY` | Supabase function secrets | `send-share-note-email` | yes | Required only when email mode is `resend`. |
| `APP_BASE_URL` | Supabase function config | `chat-with-ai`, `send-share-note-email` | no | Canonical app URL for allowed origins and email links. |
| `ALLOWED_ORIGINS` | Supabase function config | `chat-with-ai` | no | Optional explicit allowlist for browser origins. |
| `SHARE_EMAIL_MODE` | Supabase function config | `send-share-note-email` | no | Controls `mock`, `resend`, or `disabled` behavior. |
| `MAIL_FROM` | Supabase function config | `send-share-note-email` | no | Sender label/address for Resend emails. |
| `CHAT_RATE_LIMIT_WINDOW_MS` | Supabase function config | `chat-with-ai` | no | Operational tuning for AI request windows. |
| `CHAT_RATE_LIMIT_MAX_REQUESTS` | Supabase function config | `chat-with-ai` | no | Operational tuning for AI request ceilings. |
| `ADMIN_MUTATION_RATE_LIMIT_WINDOW_MS` | Supabase function config | `supabase/functions/_shared/adminMutationRateLimit.ts` | no | Admin mutation rate-limit tuning. |
| `ADMIN_MUTATION_RATE_LIMIT_MAX_REQUESTS` | Supabase function config | `supabase/functions/_shared/adminMutationRateLimit.ts` | no | Admin mutation rate-limit tuning. |

## 4) Ownership Rules
- Browser code may consume only explicitly approved public runtime values.
- Netlify and Vercel should store only the frontend public runtime contract for the client build.
- Supabase Edge Functions own provider secrets and server-only operational config.
- Service-role credentials must never be copied into `.env`, frontend source, screenshots, or README examples.

## 5) Verification Guardrails
- `src/utils/runtimeEnvContract.test.js` fails if browser code starts using unexpected `import.meta.env.*` variables.
- `src/utils/runtimeEnvContract.test.js` fails if client source contains server-only secret identifiers.
- `docs/production-security-release-checklist.md` must be completed before preview/live release signoff.
