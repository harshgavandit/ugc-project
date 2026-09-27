import { Request, Response } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks'
import { prisma } from '../../config/database.js';
import * as Sentry from "@sentry/node"

const clerkWebhooks = async (req: Request, res: Response) =>{
    try {
        const evt: any = await verifyWebhook(req)
        // Getting Data from request 
        const { data, type } = evt;

        // Switch Cases for differernt Events
        switch (type) {
            case "user.created": {
                const email = data?.email_addresses[0]?.email_address;
                const name = [data?.first_name, data?.last_name].filter(Boolean).join(' ').trim()
                    || email?.split('@')[0]
                    || 'User';

                await prisma.user.upsert({
                    where: { id: data.id },
                    create: {
                        id: data.id,
                        email,
                        name,
                        image: data?.image_url || '',
                    },
                    update: {
                        email,
                        name,
                        image: data?.image_url || '',
                    },
                })
                break;
            }

            case "user.updated": {
                const email = data?.email_addresses[0]?.email_address;
                const name = [data?.first_name, data?.last_name].filter(Boolean).join(' ').trim()
                    || email?.split('@')[0]
                    || 'User';

                await prisma.user.upsert({
                    where: { id: data.id },
                    create: {
                        id: data.id,
                        email,
                        name,
                        image: data?.image_url || '',
                    },
                    update: {
                        email,
                        name,
                        image: data?.image_url || '',
                    },
                })
                break;
            }

            case "user.deleted": {
                await prisma.user.deleteMany({ where:{ id: data.id } })
                break;
            }

            case "paymentAttempt.updated": {
                if((data.charge_type === "recurring" || data.charge_type === "checkout") && data.status === "paid") {
                    const credits = {pro: 80, premium: 240,}
                     const clerkUserId = data?.payer?.user_id;
                     const planId: keyof typeof credits = data?.subscription_items?.[0]?.plan?.slug;

                     if(planId !== "pro" && planId !== "premium"){
                        return res.status(400).json({message: "Invalid plan"})
                     }

                     console.log(planId)

                     await prisma.user.update({
                        where: {id: clerkUserId},
                        data: {
                            credits: {increment: credits[planId]}
                        }
                     })
                }
                break;
            }
        
            default:
                break;
        }

        res.json({message: "Webhook Recieved : " + type})

    } catch (error: any) {
        Sentry.captureException(error)
        res.status(500).json({ message: error.message });
    }
}

export default clerkWebhooks
