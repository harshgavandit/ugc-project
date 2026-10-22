import {Request, Response } from 'express'
import * as Sentry from "@sentry/node";
import { prisma } from '../../config/database.js';
import {v2 as cloudinary } from 'cloudinary'
import fs from 'fs';
import { generateImage, requireImageProvider } from '../../lib/openaiImage.js';
import { toGenerationErrorResponse } from '../../lib/generationError.js';


export const createProject = async (req:Request, res: Response) => {
    let tempProjectId: string | undefined;
    const { userId } = req.auth();
    let isCreditDeducted = false;
    let stage = 'upload_references';

    const {name = 'New Project', aspectRatio, userPrompt, productName, productDescription, targetLength = 5} = req.body;

    const images = (req.files || []) as Express.Multer.File[];

    if(images.length < 2 || !productName){
        return res.status(400).json({message: 'Please upload at least 2 images'})
    }

    try { requireImageProvider(); } catch (error) {
        const failure = toGenerationErrorResponse(error);
        return res.status(failure.status).json({ message: failure.message });
    }

    const user = await prisma.user.findUnique({
        where: {id: userId}
    })

    if(!user){
        return res.status(409).json({message: 'Authenticated account is not initialized'})
    }

    if(user.credits < 5){
        return res.status(402).json({message: 'Insufficient credits'})
    }else{
        // deduct credits for image generation
        await prisma.user.update({
            where: {id: userId},
            data: {credits: {decrement: 5}}
        }).then(()=>{isCreditDeducted = true});
    }

    try {

        const uploadedImages = await Promise.all(
            images.map(async(item: any)=>{
                const result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url
            })
        )

         stage = 'create_project';
         const project = await prisma.project.create({
            data: {
                name,
                userId,
                productName,
                productDescription,
                userPrompt,
                aspectRatio,
                targetLength: parseInt(targetLength),
                uploadedImages,
                isGenerating: true
            }
         })

         tempProjectId = project.id;

         const prompt = `Edit the reference photos: combine the person and product into a realistic photo.
            Make the person naturally hold or use the product.
            Match lighting, shadows, scale and perspective.
            Make the person stand in professional studio lighting.
            Output ecommerce-quality photo realistic imagery.
            Product: ${productName}. ${productDescription || ''}
            ${userPrompt || ''}`;
         stage = 'openai_image_edit';
         const finalBuffer = await generateImage({
            images: images.map(image => ({ bytes: fs.readFileSync(image.path), mimeType: image.mimetype })),
            prompt, aspectRatio: aspectRatio || '9:16',
         });

         const base64Image = `data:image/png;base64,${finalBuffer.toString('base64')}`

         stage = 'upload_generated_image';
         const uploadResult = await cloudinary.uploader.upload(base64Image, {resource_type: 'image'});

         stage = 'save_result';
         await prisma.project.update({
            where: {id: project.id},
            data: {
                generatedImage: uploadResult.secure_url,
                isGenerating: false
            }
         })

         res.json({projectId: project.id})
        
    } catch (error: unknown) {
        const failure = error as { status?: number; http_code?: number; code?: string; message?: string };
        // Log the failing boundary, never request bodies, headers, images or keys.
        console.error('generation_failed', {
            stage, status: failure?.status || failure?.http_code, code: failure?.code,
            message: String(failure?.message || 'Unknown failure')
                .replace(/sk-[A-Za-z0-9_-]+/g, '[redacted]')
                .replace(/cloudinary:\/\/\S+/g, '[redacted]')
                .slice(0, 400),
        });
        const errorResponse = toGenerationErrorResponse(error);

        if(tempProjectId!){
            // update project status and error message
            await prisma.project.update({
                where: {id: tempProjectId},
                data: {isGenerating: false, error: errorResponse.message}
            })
        }

        if(isCreditDeducted){
            // add credits back
            await prisma.user.update({
                where: {id: userId},
                data: {credits: {increment: 5}}
            })
        }
        Sentry.captureException(error);
        res.status(errorResponse.status).json({ message: errorResponse.message });
    } finally {
        await Promise.all(images.map(image => fs.promises.unlink(image.path).catch(() => undefined)));
    }
}


export const createVideo = async (_req: Request, res: Response) => {
    // OpenAI's Videos API shut down on 2026-09-24. Reject before any debit.
    return res.status(503).json({
        code: 'video_unavailable',
        message: 'Video generation is unavailable: OpenAI has discontinued its video API. No credits were charged.',
    });
}

export const getAllPublishedProjects = async (req:Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            where: {isPublished: true}
        })
        res.json({projects})

    } catch (error:any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
}

export const deleteProject = async (req:Request, res: Response) => {
    try {
        const { userId } = req.auth();
        const { projectId } = req.params;

        const project = await prisma.project.findUnique({
            where: {id: projectId, userId}
        })

         if (!project){
            return res.status(404).json({ message: 'Project not found' });
         }

         await prisma.project.delete({
            where: {id: projectId}
         })

         res.json({ message: 'Project deleted' });

    } catch (error:any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
}
