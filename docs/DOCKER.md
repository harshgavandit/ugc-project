# Docker deployment

The Compose stack contains three services:

- `client`: a production Vite build served by Nginx on the host port configured by `APP_PORT`.
- `server`: the compiled Express API. It applies committed Prisma migrations before starting.
- `database`: PostgreSQL with a named volume for persistent local data.

Nginx serves React Router fallback routes and proxies `/api/*` to the internal API service. The API and database are not published directly to the host.

## First-time configuration

From the repository root, create the Compose environment file:

```powershell
Copy-Item .env.docker.example .env
```

Replace every placeholder credential in `.env`. The root `.env` file is ignored by Git.

The generation backend uses Google AI. `GOOGLE_CLOUD_API_KEY` authorizes the default `gemini-3-pro-image` image model and `veo-3.1-generate-preview` video model; no OpenAI API key is used. The optional `GEMINI_IMAGE_MODEL` and `GEMINI_VIDEO_MODEL` values allow model upgrades without changing source code.

The configured Google AI project must be on a paid Gemini API tier for native image generation. A valid free-tier key can list the image models but receives a quota limit of zero when it tries to generate an image. Enable billing for the same project in Google AI Studio, then rebuild/restart the server; changing only the model ID does not provide free image-generation quota.

## Start the complete application

```bash
docker compose up --build
```

Open `http://localhost:8080`, or use the port configured by `APP_PORT`.

Subsequent starts can omit `--build` when source files and dependencies have not changed:

```bash
docker compose up
```

Run in the background with:

```bash
docker compose up --build -d
```

## Operations

View logs:

```bash
docker compose logs -f
```

Stop containers while preserving PostgreSQL data:

```bash
docker compose down
```

Stop containers and permanently delete the local database volume:

```bash
docker compose down --volumes
```

The last command is destructive and should be used only when the local Docker database is no longer needed.

## Clerk webhooks

For local webhook testing, Clerk must be able to reach `http://<public-host>/api/clerk`. Configure a trusted HTTPS tunnel or deployment URL in Clerk; `localhost` is not reachable by Clerk's hosted webhook service.

In the Clerk Dashboard, create a webhook endpoint using the public URL:

```text
https://<public-host>/api/clerk
```

Subscribe it to the events handled by this application:

- `user.created`
- `user.updated`
- `user.deleted`
- `paymentAttempt.updated`

After saving the endpoint, copy its **Signing Secret** into the root `.env` file:

```dotenv
CLERK_WEBHOOK_SIGNING_SECRET=whsec_replace_with_the_endpoint_signing_secret
```

The signing secret starts with `whsec_`. Do not put the webhook endpoint URL in `CLERK_WEBHOOK_SIGNING_SECRET`; the URL belongs in Clerk's endpoint configuration, while the signing secret belongs in `.env`.

Recreate the API container after changing `.env`:

```bash
docker compose up -d --force-recreate server
```

Signing in through the browser proves Clerk authentication is working, but it does not create the application's PostgreSQL user by itself. A successfully delivered `user.created` webhook creates that local user and grants the initial credits required by the generation flow.
