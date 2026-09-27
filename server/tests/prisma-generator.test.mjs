import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prismaExecutable = path.join(serverDirectory, 'node_modules', 'prisma', 'build', 'index.js');

test('generates JavaScript import specifiers without relying on a build-time tsconfig', async () => {
    const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'ugc-prisma-generator-'));
    const prismaDirectory = path.join(temporaryDirectory, 'prisma');

    try {
        await mkdir(prismaDirectory);
        await copyFile(
            path.join(serverDirectory, 'prisma', 'schema.prisma'),
            path.join(prismaDirectory, 'schema.prisma'),
        );

        await execFileAsync(
            process.execPath,
            [prismaExecutable, 'generate', '--schema', path.join(prismaDirectory, 'schema.prisma')],
            {
                cwd: temporaryDirectory,
                env: {
                    ...process.env,
                    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
                },
            },
        );

        const generatedClient = await readFile(
            path.join(temporaryDirectory, 'generated', 'prisma', 'client.ts'),
            'utf8',
        );

        assert.match(generatedClient, /from "\.\/internal\/class\.js"/);
        assert.doesNotMatch(generatedClient, /from "\.\/internal\/class\.ts"/);
    } finally {
        await rm(temporaryDirectory, {
            recursive: true,
            force: true,
            maxRetries: 5,
            retryDelay: 100,
        });
    }
});
