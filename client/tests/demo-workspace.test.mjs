import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const { initialDemoState, transitionDemo } = await import('../src/features/demo/demoState.mjs');

test('sample output requires explicit reference setup and never persists records', () => {
    assert.equal(transitionDemo(initialDemoState, 'show-output').view, 'setup');
    const ready = transitionDemo(initialDemoState, 'load-references');
    const saved = transitionDemo(ready, 'show-output');
    assert.equal(saved.view, 'saved');
    assert.equal(saved.referencesReady, true);
    assert.deepEqual(transitionDemo(saved, 'reset'), initialDemoState);
});

test('provider recovery preserves sample references and requires an explicit retry', () => {
    const ready = transitionDemo(initialDemoState, 'load-references');
    const failed = transitionDemo(ready, 'show-error');
    assert.equal(failed.view, 'error');
    assert.equal(failed.referencesReady, true);
    assert.equal(transitionDemo(failed, 'retry').view, 'saved');
    assert.equal(transitionDemo(initialDemoState, 'retry').view, 'setup');
});

test('public sample entry precedes the Clerk credential guard and shares real generation UI', async () => {
    const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');
    const demo = await readFile(new URL('../src/features/demo/DemoPage.tsx', import.meta.url), 'utf8');
    assert.match(main, /if \(!isPublicDemo && !PUBLISHABLE_KEY\)/);
    assert.match(main, /isPublicDemo \? <BrowserRouter><DemoPage/);
    assert.match(demo, /<UploadZone/);
    assert.match(demo, /<GenerationPreview/);
    assert.doesNotMatch(demo, /useAuth|useUser|apiClient|\bfetch\(|localStorage|sessionStorage|FormData/);
});
