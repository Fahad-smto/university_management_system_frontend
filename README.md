# College Org Frontend (Next.js 16)

Frontend for the College Organization backend (`https://university-org-management-backend.vercel.app`).

## Run

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:3000
npx tsc --noEmit         # type check before deploying
```

## Env (.env)

| Variable | Meaning |
|---|---|
| `BACKEND_API_URL` | Backend API, ends with `/api/v1` |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Optional. Same secrets as the backend, lets `proxy.ts` verify tokens. Without them it only checks expiry |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional. Shows the Google login button |

## bKash callback (important)

On the BACKEND set `BKASH_CALLBACK_URL=https://YOUR-FRONTEND/payment/callback`.
bKash sends the browser to the frontend page, which asks the backend to verify the payment and shows the result.

## How it works

- `src/proxy.ts`: login check, token refresh, role based redirects (`/dashboard`, `/moderator`, `/admin`)
- Server actions (`src/actions`) call the backend. Tokens from the backend are copied into cookies on this domain
- Public pages: ISR / SSG (`/`, `/notices/[id]`, `/events/[id]`), lists use SSR with URL filters
- Dashboards: SSR with the user's cookies, dialogs and menus are client components

## Pages

Public: `/`, `/notices`, `/events`, `/members`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/payment/callback`
Member: `/dashboard`, `/dashboard/profile`, `/dashboard/events`, `/dashboard/dues`, `/dashboard/payments`, `/dashboard/security`
Moderator: `/moderator`, `/moderator/members`, `/moderator/events`, `/moderator/events/[id]`, `/moderator/notices`, `/moderator/dues`
Admin: `/admin`, `/admin/users`, `/admin/payments`, `/admin/dues`

## Backend limits

- No endpoint lists PENDING members for moderators, so approval is on `/admin/users` (admins)
- No sections list endpoint, so "Assign section" asks for a section id
