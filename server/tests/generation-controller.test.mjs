import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/modules/projects/project.controller.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
const storageSource = await readFile(new URL('../src/lib/imageStorage.ts', import.meta.url), 'utf8');
const storageCode = ts.transpileModule(storageSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { storeImage } = await import(`data:text/javascript;base64,${Buffer.from(storageCode).toString('base64')}`);

function setup({ missingKey = false, providerFails = false, storageFails = false } = {}) {
    const state = { credits: 20, uploads: 0, project: null, deletedFiles: [] };
    const modules = {
        '@sentry/node': { captureException() {} },
        '../../config/database.js': { prisma: {
            user: {
                findUnique: async () => ({ credits: state.credits }),
                update: async ({ data }) => { state.credits += (data.credits.increment || 0) - (data.credits.decrement || 0); },
            },
            project: {
                create: async ({ data }) => { state.project = { id: 'p1', ...data }; return state.project; },
                update: async ({ data }) => { Object.assign(state.project, data); },
            },
        } },
        cloudinary: { v2: { uploader: { upload: async () => { if(storageFails) throw { http_code: 403 }; return { secure_url: `https://media.test/${++state.uploads}.png` }; } } } },
        '../../lib/imageStorage.js': { storeImage },
        fs: { readFileSync: () => Buffer.from('reference'), promises: { unlink: async (path) => { state.deletedFiles.push(path); } } },
        '../../lib/openaiImage.js': {
            requireImageProvider: () => { if (missingKey) throw Object.assign(new Error('missing key'), { status: 503 }); },
            generateImage: async () => { if (providerFails) throw new Error('provider failed'); return Buffer.from('generated'); },
        },
        '../../lib/generationError.js': { toGenerationErrorResponse: (error) => ({ status: error.status || 500, message: 'Generation unavailable' }) },
    };
    const exports = {};
    new Function('require', 'exports', 'console', outputText)((name) => {
        assert.ok(name in modules, `Unexpected dependency: ${name}`);
        return modules[name];
    }, exports, { error() {} });
    const req = { auth: () => ({ userId: 'u1' }), body: { productName: 'Bag', aspectRatio: '9:16' }, files: [{ path: 'product.png', mimetype: 'image/png' }, { path: 'person.jpg', mimetype: 'image/jpeg' }] };
    const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
    return { state, req, res, ...exports };
}

test('successful image generation stores the output and charges five credits once', async () => {
    const app = setup();
    await app.createProject(app.req, app.res);
    assert.equal(app.res.statusCode, 200);
    assert.deepEqual(app.res.body, { projectId: 'p1' });
    assert.equal(app.state.credits, 15);
    assert.equal(app.state.project.generatedImage, 'https://media.test/3.png');
    assert.equal(app.state.project.isGenerating, false);
    assert.equal(app.state.deletedFiles.length, 2);
});

test('provider failure refunds image credits and clears generating state', async () => {
    const app = setup({ providerFails: true });
    await app.createProject(app.req, app.res);
    assert.equal(app.res.statusCode, 500);
    assert.equal(app.state.credits, 20);
    assert.equal(app.state.project.isGenerating, false);
    assert.equal(app.state.deletedFiles.length, 2);
});

test('Cloudinary 403 does not prevent inference or discard the generated result', async () => {
    const app = setup({ storageFails: true });
    await app.createProject(app.req, app.res);
    assert.equal(app.res.statusCode, 200);
    assert.equal(app.state.credits, 15);
    assert.equal(app.state.project.generatedImage, 'data:image/png;base64,Z2VuZXJhdGVk');
    assert.equal(app.state.project.uploadedImages[0], 'data:image/png;base64,cmVmZXJlbmNl');
    assert.equal(app.state.project.isGenerating, false);
});

test('missing OpenAI configuration does not upload files, create a project or debit credits', async () => {
    const app = setup({ missingKey: true });
    await app.createProject(app.req, app.res);
    assert.equal(app.res.statusCode, 503);
    assert.equal(app.state.credits, 20);
    assert.equal(app.state.uploads, 0);
    assert.equal(app.state.project, null);
});

test('unavailable OpenAI video requests never charge credits or mark a project generating', async () => {
    const app = setup();
    await app.createVideo(app.req, app.res);
    assert.equal(app.res.statusCode, 503);
    assert.equal(app.res.body.code, 'video_unavailable');
    assert.equal(app.state.credits, 20);
    assert.equal(app.state.project, null);
});
