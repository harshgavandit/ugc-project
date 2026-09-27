import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';

const appSource = await readFile(new URL('../src/app.ts', import.meta.url), 'utf8');
const aiConfig = await readFile(new URL('../src/config/ai.ts', import.meta.url), 'utf8');
const projectRoutes = await readFile(new URL('../src/modules/projects/project.routes.ts', import.meta.url), 'utf8');
const userRoutes = await readFile(new URL('../src/modules/users/user.routes.ts', import.meta.url), 'utf8');
const authMiddleware = await readFile(new URL('../src/middleware/requireAuth.ts', import.meta.url), 'utf8');
const clerkWebhook = await readFile(new URL('../src/modules/webhooks/clerk.controller.ts', import.meta.url), 'utf8');

test('keeps the public API mount points', () => {
    assert.match(appSource, /app\.post\('\/api\/clerk'/);
    assert.match(appSource, /app\.use\('\/api\/user'/);
    assert.match(appSource, /app\.use\('\/api\/project'/);
});

test('verifies Clerk webhooks before JSON parsing', () => {
    const webhookPosition = appSource.indexOf("app.post('/api/clerk'");
    const jsonParserPosition = appSource.indexOf('app.use(express.json())');

    assert.ok(webhookPosition >= 0);
    assert.ok(jsonParserPosition > webhookPosition);
});

test('keeps project and user endpoint paths', () => {
    for (const path of ["'/create'", "'/video'", "'/published'", "'/:projectId'"]) {
        assert.ok(projectRoutes.includes(path));
    }

    for (const path of ["'/credits'", "'/projects'", "'/projects/:projectId'", "'/publish/:projectId'"]) {
        assert.ok(userRoutes.includes(path));
    }
});

test('provisions authenticated users before protected uploads are parsed', () => {
    assert.match(authMiddleware, /await ensureUserProvisioned\(userId\)/);
    assert.match(projectRoutes, /post\('\/create', requireAuth, upload\.array/);
});

test('keeps Clerk user synchronization idempotent', () => {
    assert.match(clerkWebhook, /case "user\.created"[\s\S]*?prisma\.user\.upsert/);
    assert.match(clerkWebhook, /case "user\.updated"[\s\S]*?prisma\.user\.upsert/);
    assert.match(clerkWebhook, /case "user\.deleted"[\s\S]*?prisma\.user\.deleteMany/);
});

test('uses supported Google generation model defaults', () => {
    assert.match(aiConfig, /GEMINI_IMAGE_MODEL.*gemini-3-pro-image/);
    assert.match(aiConfig, /GEMINI_VIDEO_MODEL.*veo-3\.1-generate-preview/);
});
