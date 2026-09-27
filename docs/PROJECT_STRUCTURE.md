# Project Structure

The repository contains independently installable frontend and backend applications. Public URLs, API endpoints, request and response contracts, database models, and authentication behavior remain unchanged.

```text
ugc-project/
|-- client/
|   |-- public/                    # Static files copied by Vite
|   `-- src/
|       |-- app/                   # Application composition and routes
|       |-- assets/                # Images, videos, and brand assets
|       |-- components/
|       |   |-- layout/            # Navbar, footer, and page-wide behavior
|       |   `-- ui/                # Reusable presentation components
|       |-- data/                  # Static marketing content
|       |-- features/
|       |   |-- billing/           # Plans page
|       |   |-- community/         # Community page and local styles
|       |   |-- generation/        # Generation pages, components, and types
|       |   `-- marketing/         # Landing-page sections and composition
|       |-- lib/                   # Shared infrastructure such as HTTP
|       |-- main.tsx               # Browser bootstrap
|       `-- index.css              # Global styles and design tokens
|-- server/
|   |-- prisma/                    # Canonical schema and migrations
|   |-- src/
|   |   |-- config/                # AI, database, upload, and monitoring
|   |   |-- middleware/            # Cross-cutting Express middleware
|   |   |-- modules/               # Feature controllers and routers
|   |   |   |-- projects/
|   |   |   |-- users/
|   |   |   `-- webhooks/
|   |   |-- types/                 # Server TypeScript declarations
|   |   `-- app.ts                 # Express application composition
|   `-- server.ts                  # Compatible runtime/deployment entrypoint
|-- compose.yaml                   # Complete client, API, and PostgreSQL stack
|-- .env.docker.example           # Non-secret Compose configuration template
|-- docs/DOCKER.md                # Docker operations and deployment guide
|-- docs/PROJECT_STRUCTURE.md
`-- README.md
```

## Dependency rules

- Pages compose feature components; reusable UI stays under `components/ui`.
- Feature-specific types and components remain inside their owning feature.
- Shared infrastructure belongs in `lib` on the client or `config` and `middleware` on the server.
- Server routers define the existing HTTP surface and delegate to controllers.
- Prisma schema and migrations remain the persistence source of truth.
- Promote code into a shared folder only when more than one feature needs it.

## Compatibility boundaries

These paths and behaviors are public contracts and must not change during structural refactors:

- Client routes: `/`, `/generate`, `/result/:projectId`, `/my-generations`, `/community`, `/plans`, and `/loading`.
- Server routes below `/api/clerk`, `/api/user`, and `/api/project`.
- Clerk bearer authentication and raw-body webhook verification order.
- Prisma fields, defaults, relations, and migrations.
- Credit deductions and refunds, generation prompts, Cloudinary uploads, and response payloads.

## Adding code

1. Put feature-only code under the owning feature or module.
2. Keep route handlers focused on HTTP orchestration; extract reusable external-service workflows into a feature service.
3. Add environment keys to the relevant `.env.example` without committing secrets.
4. Run `npm run verify` from the repository root before delivery.
