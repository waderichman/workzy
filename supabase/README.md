# Supabase Setup

This project now has a production scaffold for Supabase auth and data storage.

## 1. Create the project

1. Create a Supabase project.
2. Copy the project URL and anon key.
3. Put them in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Run the schema

Open the Supabase SQL editor and run [`schema.sql`](/c:/Users/irene/OneDrive/Desktop/IOS/supabase/schema.sql).

That creates:

- `profiles` for poster/tasker accounts
- `tasker_service_areas` for ZIP codes a tasker covers
- `tasks`, `task_tags`
- `conversations`, `conversation_participants`, `messages`
- `reviews`
- row-level security policies

## 3. ZIP-code matching

The production rule is:

- Posters can always see tasks they posted.
- Taskers can only see open tasks where `tasks.zip_code` matches one of their rows in `tasker_service_areas`.
- Posters only reach taskers who cover the posted ZIP code.

That logic is enforced in two places:

- Local prototype logic in the Zustand store
- Database visibility rules in the `tasks` RLS policy

## 4. App integration path

Use [`lib/supabase.ts`](/c:/Users/irene/OneDrive/Desktop/IOS/lib/supabase.ts) as the shared client.

Recommended next migration steps:

1. Replace local `login` and `signUp` store actions with `supabase.auth.signInWithPassword` and `supabase.auth.signUp`.
2. Save profile rows to `profiles` after sign-up.
3. Load visible tasks with a query or RPC that joins `tasks`, `task_tags`, and participant data.
4. Replace the in-memory conversation/task mutations with inserts and updates against Supabase tables.
5. Add realtime subscriptions for `messages` and `tasks`.

## 5. Hosting

- iOS app: build and ship with Expo EAS / App Store
- Backend logic if needed: Supabase Edge Functions or Vercel
- Database/auth/storage: Supabase
