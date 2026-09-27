import { Request, Response, NextFunction } from 'express';
import * as Sentry from "@sentry/node"
import { ensureUserProvisioned } from '../modules/users/user.provisioning.js';

export const requireAuth = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const {userId} = req.auth()

        if(!userId) {
            return res.status(401).json({message: 'Unauthorized'})
        }

        await ensureUserProvisioned(userId)
        next()
    } catch (error: any) {
        Sentry.captureException(error)
        res.status(503).json({message: 'Unable to initialize the authenticated account'})
    }
}
