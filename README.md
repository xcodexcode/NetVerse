# NetVerse

NetVerse is a hands-on study app for networking, Linux, and AWS fundamentals.

I built it as a practical lab space: a place to practice subnetting, sketch small networks, run simple connectivity checks, keep lab notes, and prepare for junior infrastructure interviews.

Live site: https://thenetverse-fa29d.web.app

## What works today

- Visual network simulator with PCs, switches, routers, and servers
- Guided networking labs with validation
- Subnet calculator with masks, host ranges, wildcard masks, and binary output
- Linux command drills
- AWS flashcards and architecture practice
- Packet-flow walkthroughs
- Linux hardening checklist
- Interview practice prompts
- Firebase email/password auth
- Firestore project saves and lab progress

## Current limits

NetVerse is deployed on Firebase's free Spark plan, so it is a static app. There is no server runtime in production right now.

That means the simulator uses local rule-based diagnostics instead of a hosted backend service. The core learning tools still work in the browser.

## Tech stack

- Next.js App Router with static export
- TypeScript
- Tailwind CSS
- React Flow
- Radix UI components
- Framer Motion
- Zustand
- Zod
- Firebase Hosting
- Firebase Auth
- Cloud Firestore
- Vitest

## Local setup

```powershell
npm.cmd install
Copy-Item .env.local.example .env.local
npm.cmd run dev
```

Then open:

```text
http://localhost:3000
```

For a production-style static build:

```powershell
npm.cmd run build
```

Firebase Hosting serves the generated `out/` folder.

## Environment variables

Use `.env.local.example` as the template. Put real values in `.env.local`; that file is ignored by Git.

The Firebase `NEXT_PUBLIC_*` values are browser config for a Firebase web app. They are not server secrets, but Firestore rules and authorized domains still matter.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Firebase setup

1. Create a Firebase project.
2. Add a Firebase web app.
3. Copy the web config into `.env.local`.
4. Enable Authentication with Email/Password.
5. Create a Firestore database.
6. Deploy rules, indexes, and Hosting:

```powershell
npx.cmd firebase deploy --only hosting,firestore:rules,firestore:indexes
```

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
```

## Security notes

- Do not commit `.env`, `.env.local`, service account JSON files, private keys, or Firebase admin keys.
- The repository intentionally ignores common Firebase secret file names.
- Firestore access is scoped by authenticated user ID in `firestore.rules`.
- The static Spark deployment does not require a server API key.
