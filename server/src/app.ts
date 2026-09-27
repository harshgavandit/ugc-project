import { clerkMiddleware } from '@clerk/express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import express, { type Request, type Response } from 'express';

import projectRouter from './modules/projects/project.routes.js';
import userRouter from './modules/users/user.routes.js';
import clerkWebhooks from './modules/webhooks/clerk.controller.js';

const app = express();

app.use(cors());

// Clerk requires the raw request body to verify webhook signatures.
app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkWebhooks);

app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (_req: Request, res: Response) => {
    res.send('Server is Live!');
});

// Retained for backward compatibility with the existing Sentry verification flow.
app.get('/debug-sentry', () => {
    throw new Error('My first Sentry error!');
});

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

// Sentry's error handler must follow all controllers and routes.
Sentry.setupExpressErrorHandler(app);

export default app;
