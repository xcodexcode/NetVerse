# NetVerse

Build. Break. Fix. Master networks.

NetVerse is an AI-powered network lab for IT students, CCNA beginners, and junior network engineers. It combines a visual topology builder, deterministic connectivity testing, guided labs, and a context-aware debug assistant in one focused product experience.

## What NetVerse Does

- Build network topologies visually with PCs, switches, routers, and servers
- Connect devices on a live canvas and edit core network settings
- Run ping tests and get clear success or failure diagnostics
- Analyze broken networks with an AI assistant grounded in the current topology
- Complete guided labs with validation and saved progress
- Save and resume projects through authenticated user sessions

## MVP Scope

The current MVP includes:

- Visual network simulator
- Ping and path validation engine
- AI network debugging panel
- Three guided labs
- Authenticated dashboard and project library
- Firebase-backed persistence

## Product Experience

NetVerse is designed to feel like a serious engineering tool:

- dark-mode-first UI
- premium electric green and blue visual system
- subtle motion and polished panels
- beginner-friendly explanations without watering down the technical logic
- desktop-first simulator workspace with responsive supporting screens

## Tech

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style component system
- React Flow
- Framer Motion
- Zustand
- Zod
- Firebase Auth and Firestore
- OpenAI API through a secure server route

## Repo Notes

This is the public product repository for NetVerse.

- Production infrastructure is managed by the NetVerse team.
- Production secrets are not stored in this repository.
- The app is deployed through managed Firebase infrastructure.

## Team Development

For local team development:

```powershell
npm.cmd install
Copy-Item .env.local.example .env.local
npm.cmd run dev
```

Then open `http://localhost:3000`.

`npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test`, and `npm.cmd run build` are all configured.

## Status

NetVerse is currently in MVP stage and focused on:

- core network simulation flows
- explainable troubleshooting
- polished onboarding for students and early-career engineers
- strong product presentation for demos and early adoption
