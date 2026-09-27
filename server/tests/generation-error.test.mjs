import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/generationError.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
    },
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
const { toGenerationErrorResponse } = await import(moduleUrl);

test('maps zero free-tier image quota to an actionable billing response', () => {
    const response = toGenerationErrorResponse(new Error(JSON.stringify({
        error: {
            code: 429,
            status: 'RESOURCE_EXHAUSTED',
            message: 'Quota exceeded for free_tier_requests, limit: 0',
        },
    })));

    assert.equal(response.status, 503);
    assert.match(response.message, /Enable paid Gemini API billing/);
    assert.match(response.message, /credits were restored/);
});

test('keeps temporary provider throttling distinct from unavailable free-tier quota', () => {
    const response = toGenerationErrorResponse({ status: 429, message: 'Too many requests' });

    assert.equal(response.status, 429);
    assert.match(response.message, /retry later/i);
});

test('does not expose unknown provider details to the browser', () => {
    const response = toGenerationErrorResponse(new Error('internal provider details'));

    assert.equal(response.status, 500);
    assert.doesNotMatch(response.message, /internal provider details/);
});
