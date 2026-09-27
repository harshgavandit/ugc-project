import { clerkClient } from '@clerk/express';
import { prisma } from '../../config/database.js';

/**
 * Ensures that an authenticated Clerk account has the local database record
 * required by the application. Clerk webhooks remain the primary sync path;
 * this fallback handles local development and temporarily unavailable webhook
 * delivery without resetting an existing user's credits.
 */
export const ensureUserProvisioned = async (userId: string) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });

    if (existingUser) {
        return;
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress
        ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
        throw new Error('The authenticated Clerk user does not have an email address');
    }

    const name = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || clerkUser.username || email.split('@')[0];

    await prisma.user.upsert({
        where: { id: userId },
        create: {
            id: userId,
            email,
            name,
            image: clerkUser.imageUrl,
        },
        update: {
            email,
            name,
            image: clerkUser.imageUrl,
        },
    });
};
