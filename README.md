# UGC AI Platform

UGC AI is a full-stack content-generation platform that combines product and model images to create marketing imagery and short-form video. It includes authenticated project management, credit accounting, community publishing, Clerk webhooks, Google AI generation, Cloudinary media storage, and PostgreSQL persistence through Prisma.

Live application: [ugc-project-harsh.vercel.app](https://ugc-project-harsh.vercel.app/)

## Technology

- Client: React 19, TypeScript, Vite, Tailwind CSS, Clerk, Axios, Framer Motion
- Server: Node.js, Express 5, TypeScript, Clerk, Prisma, PostgreSQL
- Generation and media: Google GenAI and Cloudinary
- Monitoring and deployment: Sentry and Vercel

## Repository layout

- `client/src/app`: application composition and route registration
- `client/src/components`: shared layout and UI primitives
- `client/src/features`: billing, community, generation, and marketing features
- `client/src/lib`: shared client infrastructure
- `server/src/config`: external service and infrastructure configuration
- `server/src/middleware`: cross-cutting request middleware
- `server/src/modules`: project, user, and webhook modules
- `server/prisma`: the canonical database schema and migrations

See [Project Structure](docs/PROJECT_STRUCTURE.md) for the complete layout, dependency rules, and compatibility boundaries.

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL
- Clerk, Google AI, and Cloudinary credentials

## Setup

Install both applications from the repository root:

```bash
npm run install:all
```

Create the root environment file used by Docker Compose and the Vite client:

```bash
cp .env.docker.example .env
```

On PowerShell, use:

```powershell
Copy-Item .env.docker.example .env
```

Fill in the real credentials in the root `.env`; it is ignored by Git. Vite reads this file through `client/vite.config.ts` and exposes only `VITE_`-prefixed values to browser code. When running the API outside Docker, create `server/.env` from `server/.env.example` or otherwise provide the same server variables to that process. Dependency installation runs Prisma generation automatically through the server `postinstall` script.

The generation implementation uses Google AI—not OpenAI. Image generation defaults to `gemini-3-pro-image`, video generation defaults to `veo-3.1-generate-preview`, and both use `GOOGLE_CLOUD_API_KEY`. Override their model IDs with `GEMINI_IMAGE_MODEL` and `GEMINI_VIDEO_MODEL` when needed. The application does not read an OpenAI API key.

Google's native image-generation models do not currently include Gemini API free-tier quota. The Google AI project associated with `GOOGLE_CLOUD_API_KEY` must have paid billing enabled; otherwise generation returns a quota-limit error even though the key itself is valid. Application credits are restored automatically when the provider rejects a generation request.

## Development

Run the applications in separate terminals from the repository root:

```bash
npm run dev:server
npm run dev:client
```

The default local URLs are:

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

When the Vite client is run on port `5173` without an explicit `VITE_BASEURL`, it uses the Docker gateway at `http://localhost:8080` for API requests. Start the Compose stack first with `docker compose up -d`. To use a standalone local API instead, set `VITE_BASEURL=http://localhost:5000` in the root `.env` and run `npm run dev:server`.

## Docker

After copying `.env.docker.example` to the root `.env` file and replacing its placeholder credentials, start the client, API, migrations, and PostgreSQL database with one command:

```bash
docker compose up --build
```

Open `http://localhost:8080`. See [Docker deployment](docs/DOCKER.md) for background mode, logs, shutdown, data persistence, and local Clerk webhook guidance.

For authenticated generation, configure Clerk's public webhook endpoint separately from its signing secret. The endpoint URL ends in `/api/clerk`; the value stored as `CLERK_WEBHOOK_SIGNING_SECRET` must be the endpoint's `whsec_...` signing secret. The Docker guide lists the required event subscriptions and restart command.

## Quality checks

Run the complete repository verification pipeline:

```bash
npm run verify
```

The pipeline runs client and server linting, TypeScript checks, route-contract tests, and both production builds. The project does not yet have feature-level automated tests; `node --test` is the standard entrypoint so coverage can grow without changing CI commands.

Individual commands are also available:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Compatibility guarantees

The refactored structure preserves the existing client URLs, Express API paths, request and response payloads, Clerk authentication and webhook handling, Prisma schema and migrations, credit behavior, generation workflows, Cloudinary uploads, and deployment entrypoint.

## Author

Harsh Gavand — [GitHub](https://github.com/harshgavandit)
