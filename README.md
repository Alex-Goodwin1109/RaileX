# RaileX — Smart Train Booking

A reimagining of the train booking experience in India. RaileX is a mobile-first, offline-capable booking simulator with an conversational AI orb, Tatkal preparation alerts, waitlist intelligence, 3D train viewer, and more.

> **Note:** RaileX is a booking simulation — it does not issue real tickets and is not affiliated with IRCTC or Indian Railways.

## Features

- **Conversational orb** — book in plain Hindi or English, no forms, no jargon
- **Tatkal preparation** — pre-fills everything before the window opens, pings you at the right moment
- **Waitlist intelligence** — estimates your confirmation probability before you book
- **Sun-side predictor** — tells you which window seat avoids afternoon heat
- **3D train viewer** — find your exact coach in a scrollable model of the full train
- **Journey safety broadcast** — share your PNR and coach with a trusted contact in one tap
- **Works offline** — your journey details are available even without signal

## Tech Stack

React · TanStack Start · Three.js · Tailwind CSS · Web Audio API · Service Worker · Vite

## Development

Requires [Bun](https://bun.sh) (or Node.js + npm).

```sh
bun install
bun run dev
```

## Building & Deployment

```sh
bun run build
```

Deploy to Vercel by connecting your Git repository. Vercel auto-detects TanStack Start + Nitro.

## Project Structure

```
src/
  routes/         # TanStack Start file-based routes
  components/
    rail/         # Domain-specific components
    ui/           # shadcn/ui primitives
  lib/            # Business logic, data, utilities
  assets/         # Asset JSON manifests (URLs point to /public/assets/)
public/
  assets/         # Static files: images, audio
```
