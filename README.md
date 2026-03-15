# TaskDash

Expo/React Native prototype for a local task marketplace app inspired by products like Airtasker.

## Included

- Two-sided flow with `poster` and `tasker` roles
- Discover screen for local jobs and category browsing
- Post flow for publishing a task with an opening budget
- Inbox screen for chat, questions, and offer negotiation
- Profile screen with role switching and account stats
- Local backend serving seeded marketplace data
- Zustand state with persisted active role and selected thread

## Run

1. Install Node 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `EXPO_PUBLIC_API_BASE_URL` to your local backend URL.
5. Run `npm run backend`.
6. In another terminal run `npx expo start`.

Example:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.25:4000
```

## API

- `GET /api/health`
- `GET /api/marketplace`

The backend is currently in-memory and seeded for prototyping. The next production step would be
real auth, persistent storage, media upload, booking, and payouts.
