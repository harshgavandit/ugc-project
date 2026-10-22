import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const { Response } = globalThis;

test('edits both reference images with the OpenAI key and returns PNG bytes', async () => {
    const source = await readFile(new URL('../src/lib/openaiImage.ts', import.meta.url), 'utf8').catch(() => 'export const generateImage = async () => null;');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
    const { generateImage } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
    const result = await generateImage({
        images: [{ bytes: Buffer.from('product'), mimeType: 'image/png' }, { bytes: Buffer.from('person'), mimeType: 'image/jpeg' }],
        prompt: 'Combine product and person', aspectRatio: '9:16',
    }, { apiKey: 'test-only', fetch: async (url, options) => {
        assert.equal(url, 'https://api.openai.com/v1/images/edits');
        assert.equal(options.headers.Authorization, 'Bearer test-only');
        assert.equal(options.body.get('model'), 'gpt-image-1-mini');
        assert.equal(options.body.get('quality'), 'low');
        assert.equal(options.body.get('size'), '1024x1536');
        assert.equal(options.body.get('prompt'), 'Combine product and person');
        const images = options.body.getAll('image[]');
        assert.equal(images.length, 2);
        assert.equal(await images[0].text(), 'product');
        assert.equal(await images[1].text(), 'person');
        return Response.json({ data: [{ b64_json: Buffer.from('output').toString('base64') }] });
    } });
    assert.equal(result?.toString(), 'output');
});

const load = async () => {
    const source = await readFile(new URL('../src/lib/openaiImage.ts', import.meta.url), 'utf8').catch(() => 'export const generateImage = async () => null;');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
    return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
};
const input = { images: [{ bytes: Buffer.from('a'), mimeType: 'image/png' }, { bytes: Buffer.from('b'), mimeType: 'image/png' }], prompt: 'Edit', aspectRatio: '16:9' };

test('fails before making a request when the backend OpenAI key is absent', async () => {
    const { generateImage } = await load();
    await assert.rejects(generateImage(input, { apiKey: '', fetch: async () => { assert.fail('must not call provider'); } }), { code: 'provider_not_configured' });
});

test('preserves OpenAI error codes for actionable billing/access responses', async () => {
    const { generateImage } = await load();
    await assert.rejects(generateImage(input, { apiKey: 'test-only', fetch: async () => Response.json({ error: { code: 'insufficient_quota', message: 'Billing required' } }, { status: 429 }) }), { status: 429, code: 'insufficient_quota' });
});

test('rejects successful provider responses with no image', async () => {
    const { generateImage } = await load();
    await assert.rejects(generateImage(input, { apiKey: 'test-only', fetch: async () => Response.json({ data: [] }) }), /no image/i);
});
