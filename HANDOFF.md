# AC7 Elite Fitness — Handoff

Premium fitness platform: gamified seasonal missions (AI camera rep-counting), coach
marketplace, realtime community, shop, certificates.

## Stack
- Next.js 14 App Router + TypeScript + Tailwind
- Supabase (Auth, Postgres, Realtime, Storage), project ref `ceokjxnmvmptuqdclora`
- TensorFlow.js MoveNet (in-browser pose detection for rep counting)
- Design system in `src/app/globals.css` (glassmorphism cards, blue+white over gym photo bg)

## Run
```
npm run dev          # http://localhost:3001
npm run dev:clean    # if ChunkLoadError (clears .next)
```
Do NOT run `npm run build` while `dev` is running (it breaks the dev server's chunks).

## Environment
`.env.local` holds `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Admin account: ghaalabh10@gmail.com (role=admin).

## Design system
- Theme toggle (dark/light) via `src/context/ThemeContext.tsx`; backgrounds `/gym-bg.png` (dark), `/gym-bg-light.png` (light).
- `AppHeader` (global top nav): Home·Courses·Calendar·Shop·Profile | AC7 ELITE logo | theme·language·user.
- Classes: `ac7-card`, `ac7-btn`/`ac7-btn-outline`, `ac7-grid`, typography `h-xl/h-l/h-m/body-text/caption`.
- Tokens: `surface` #0F172A, `navy` (accent) #3B82F6. Cards must stand out from the bg (elevation shadows).

## Database (migrations in supabase/migrations)
- 001–006: users, coaches, bookings, missions, messages, shop, community groups, announcements, achievements, coach_reviews
- 007: missions.stage_progress
- 008: exercise_videos (+ `kind` demo|pct) + `exercise-videos` storage bucket; upload gated to admin/verified coaches
- 009: conversations, conversation_participants, chat_messages (text/voice/system), calls, announcements (importance/expires_at/author_id), seasons, season_enrollments, stage_completions, certificates, `voice-messages` bucket; `start_direct_conversation` RPC
- 010: fixed chat RLS recursion via `is_conversation_member` / `is_public_conversation` SECURITY DEFINER fns

## Status by phase
DONE: theme, top nav, Home/Courses/Missions(grid)/Shop/Profile/Calendar/Coach/Admin redesign,
public chat (realtime, verified), private chat (text), user search, voice messages,
announcements (Normal/Important + 30m–24h timed + global banner), certificates page (+PDF print),
PCT showcase, seasons rank definitions (Bronze 30→Ace5 2, Diamond 17, Master), camera rep-counter with form grading.

PENDING:
- #4 Season progression ENGINE: per-season stage_completions tracking → rank unlock → auto-issue
  certificate → roll into A2. Schema + UI exist; the trainer still uses the old flat
  `missions.stage_progress` and does not yet write `stage_completions`. This is the main open item.
- Voice/Video CALLS: DB signaling rows exist; real audio/video needs WebRTC + a TURN server (infra).
- Push notifications: needs VAPID/FCM keys + service worker.
- Full i18n: language selector saves choice; actual translation layer not built.

## Notes
- Repo root is the user's home dir; commits are scoped to apps/ac7-fitness only.
- Project lives in a OneDrive-synced folder → occasional `.next` corruption; use `dev:clean`.
