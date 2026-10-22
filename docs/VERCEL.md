# Vercel generation setup

The frontend at `ugc-project-harsh.vercel.app` calls the separate API deployment
at `ugc-project-server-beta.vercel.app`. Generation credentials belong on the
**backend** Vercel project, with Root Directory `server`.

In backend Settings > Environment Variables, configure these values for Production
(and Preview if you test preview deployments), then redeploy:

```dotenv
OPENAI_API_KEY=<your private OpenAI project key>
OPENAI_IMAGE_MODEL=gpt-image-1-mini
DATABASE_URL=<PostgreSQL connection string>
CLERK_PUBLISHABLE_KEY=<Clerk publishable key>
CLERK_SECRET_KEY=<Clerk secret key>
CLERK_WEBHOOK_SIGNING_SECRET=<Clerk webhook signing secret>
CLOUDINARY_URL=<Cloudinary connection URL>
```

The frontend project uses Root Directory `client`, with
`VITE_BASEURL=https://ugc-project-server-beta.vercel.app` and
`VITE_CLERK_PUBLISHABLE_KEY`. Never prefix a private API key with `VITE_` or put
it in a frontend file. Redeploy both projects for this change.

Images use OpenAI `/v1/images/edits` with both product and person references,
`gpt-image-1-mini`, `quality=low`, and one PNG output. Portrait uses 1024x1536;
landscape uses 1536x1024. These are the supported model sizes, not exact 9:16 or
16:9 crops. Input processing and output both incur OpenAI API charges. A ChatGPT
subscription does not fund API usage. Check API billing, project spending limits,
model access, and organization verification if generation returns an access error.

The API's Vercel function requests a 300-second maximum duration; verify that the
deployed function's plan/settings allow it. The provider call has a 240-second
timeout. A platform termination can still interrupt persistence/refunds; this
synchronous flow is not a durable background job. Keep the two uploaded files
and multipart overhead below Vercel's function request-body limit (4.5 MB).

**Video is unavailable with OpenAI alone as of October 22, 2026.** OpenAI shut
down the Sora models and Videos API on September 24, 2026, with no direct replacement.
`POST /api/project/video` returns 503 and `video_unavailable` without deducting
credits or invoking another provider. Previously saved videos remain playable.
Source: https://developers.openai.com/api/docs/guides/video-generation

After deployment, sign in and upload two small PNG/JPEG/WebP references. Verify
that the image appears on the result page and in saved projects; repeat with a
provider failure to verify the credit refund. Missing keys fail before upload or
credit deduction. Test the video endpoint to confirm the unavailable message and
unchanged credit balance. Do not treat build/test success as live generation proof.

Rotate any API key pasted into a conversation, screenshot, or tracked file.
