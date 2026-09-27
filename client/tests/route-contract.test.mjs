import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const heroSource = await readFile(new URL('../src/features/marketing/components/Hero.tsx', import.meta.url), 'utf8');
const navbarSource = await readFile(new URL('../src/components/layout/Navbar.tsx', import.meta.url), 'utf8');

test('keeps the public client route contract', () => {
    const routes = ['/', '/generate', '/result/:projectId', '/my-generations', '/community', '/plans', '/loading'];

    for (const route of routes) {
        assert.ok(appSource.includes(`path='${route}'`), `missing client route: ${route}`);
    }
});

test('routes the primary hero CTA to the generation page', () => {
    assert.match(heroSource, /<Link to="\/generate"/);
    assert.doesNotMatch(heroSource, /<a href="\/"[^>]*>\s*<PrimaryButton/);
});

test('waits for Clerk session hydration before exposing sign-in actions', () => {
    assert.match(navbarSource, /const \{user, isLoaded\} = useUser\(\)/);
    assert.match(navbarSource, /isLoaded && \(!user \?/);
    assert.match(navbarSource, /isLoaded && !user &&/);
});
