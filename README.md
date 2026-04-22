# NetVerse

NetVerse is a startup-style MVP for network engineers and IT students.

It combines:

- a visual topology simulator
- a deterministic connectivity engine with ping diagnostics
- a server-side AI debug assistant
- guided labs with validation and progress tracking
- Firebase auth and project persistence

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI components
- React Flow
- Framer Motion
- Zustand
- Zod
- Firebase Auth
- Cloud Firestore
- OpenAI API through a secure server route

## Project structure

```txt
src/
  app/
  components/
  hooks/
  lib/
    ai/
    firebase/
    labs/
    simulator/
    utils/
    validations/
  store/
  types/
tests/
```

## Local development

1. Install dependencies:

```powershell
npm.cmd install
```

2. Copy the example environment file and fill in your values:

```powershell
Copy-Item .env.local.example .env.local
```

3. Start the Next.js dev server:

```powershell
npm.cmd run dev
```

4. Open:

```text
http://localhost:3000
```

## Environment variables

These examples are placeholder names only. No real secrets should ever be committed to the repo.

The `NEXT_PUBLIC_*` Firebase web config is not a private server secret. It is expected to be available to the browser in Firebase web apps.

Keep the following values out of Git and only in local env files or hosted secret managers:

- `FIREBASE_ADMIN_PRIVATE_KEY`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `OPENAI_API_KEY`

Public Firebase web config placeholders:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Server-side Firebase Admin placeholders:

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

AI:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Use `.env.local.example` as the template and put your real values into `.env.local`, which is gitignored.

## Firebase setup

1. Create a Firebase project.
2. Enable Authentication with Email/Password.
3. Create a Firestore database.
4. Add a Firebase Web App and copy the public web config into `.env.local`.
5. Add Admin SDK credentials for local development or use the App Hosting service account in production. Never commit Admin credentials.
6. Deploy Firestore rules and indexes:

```powershell
firebase deploy --only firestore
```

## Firestore collections

- `users`
  - `displayName`
  - `email`
  - `createdAt`
  - `level`
- `projects`
  - `userId`
  - `title`
  - `topology`
  - `createdAt`
  - `updatedAt`
- `labProgress`
  - `userId`
  - `labId`
  - `completed`
  - `score`
  - `updatedAt`
- `userSettings`
  - `theme`
  - `preferences`

## Firebase App Hosting deployment

This app is set up for Firebase App Hosting with `apphosting.yaml`.

1. Push the repository to GitHub.
2. In Firebase console, open App Hosting and create a backend for this repo.
3. Point the backend at the repository root.
4. Add the required secret values referenced in `apphosting.yaml`.
5. Deploy Firestore rules and indexes with the Firebase CLI.
6. Trigger a rollout from the live branch.

Helpful commands:

```powershell
firebase deploy --only firestore
firebase emulators:start
```

## Quality checks

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
```

## Notes

- If Firebase is not configured, auth and persistence fall back to a local demo mode so the product remains explorable.
- If `OPENAI_API_KEY` is missing, the AI panel falls back to simulator-rule summaries instead of failing hard.
- The simulator currently models simplified IPv4 networking for MVP-level teaching scenarios.
