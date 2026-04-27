# NetVerse

**Build. Break. Fix. Master networks.**

NetVerse is a hands-on learning workspace for network engineers, IT students, CCNA beginners, and junior infrastructure operators.

It combines a visual network simulator, guided labs, diagnostics, note-taking, flashcards, resource guarding, productivity tools, converters, and roadmap planning into one focused engineering environment.

Live product: https://thenetverse-fa29d.web.app

## Product

NetVerse is designed around a simple idea: learning networking should feel practical, visual, and repeatable.

Instead of jumping between notebooks, subnet calculators, YouTube playlists, flashcard apps, task lists, and topology sketches, NetVerse brings the core learning loop into one place:

- Build a topology.
- Break it safely.
- Diagnose what failed.
- Capture the lesson.
- Convert it into flashcards.
- Plan the next milestone.

## What Is Live

- Visual simulator with PCs, switches, routers, servers, links, device configs, and ping validation.
- Explainable connectivity diagnostics for subnet, gateway, path, and router interface issues.
- Guided labs with objectives, validation, hints, completion state, and saved progress.
- Academy modules for subnetting, AWS, Linux, packet flow, hardening, cost awareness, and interviews.
- Learning Studio with notes, concept schemas, flashcards, resource vault, Pomodoro, tasks, converters, and roadmap builder.
- Project library for saved topologies.
- Firebase Auth and Firestore-backed persistence.
- Dark, premium, engineering-focused UI.

## Learning Studio

Studio turns NetVerse from a simulator into a full learning operating system.

- Notes workspace: capture lab summaries, commands, mistakes, and explanations.
- Concept schema board: visually map topics like subnets, switches, routers, NAT, gateways, and packet flow.
- Flashcard forge: create cards manually, generate cards from notes, or import simple text/PDF material.
- Resource guard: save high-signal links, docs, tools, videos, and YouTube playlists.
- Pomodoro cockpit: run focused study blocks without leaving the app.
- Mission list: track daily practice tasks.
- Engineer converters: subnet, binary/decimal/hex, bandwidth-delay product, MTU payload, and common ports.
- Roadmap builder: use presets or build a custom path for CCNA, cloud networking, or Linux network ops.

## Tech

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Flow
- Radix UI primitives
- Framer Motion
- Zustand
- Zod
- Firebase Hosting
- Firebase Auth
- Cloud Firestore
- Vitest

## Status

NetVerse is in active product development. The current build is a polished MVP moving toward a broader network-learning platform.

The public repository does not contain secrets, private deployment credentials, Firebase admin keys, or production environment files.

## Quality Bar

NetVerse is built to feel like a serious product:

- Practical workflows over toy demos.
- Beginner-friendly language without dumbing down the engineering.
- Clean separation between UI, simulator logic, persistence, diagnostics, labs, and learning tools.
- Typed models and tested critical utility logic.
- Public-facing copy that represents an owned product, not a clone-and-configure template.
