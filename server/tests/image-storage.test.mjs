import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/imageStorage.ts', import.meta.url), 'utf8').catch(() => 'export const storeImage = async () => "";');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { storeImage } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('keeps a successful external image URL', async () => {
    assert.equal(await storeImage(Buffer.from('photo'), 'image/png', async () => ({ secure_url: 'https://media.test/photo.png' })), 'https://media.test/photo.png');
});

test('preserves image bytes in a data URL when external storage rejects an upload', async () => {
    const result = await storeImage(Buffer.from('photo'), 'image/png', async () => { throw { http_code: 403 }; });
    assert.equal(result, 'data:image/png;base64,cGhvdG8=');
});
