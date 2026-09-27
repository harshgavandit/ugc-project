import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_CLOUD_API_KEY,
})

export const aiModels = {
    image: process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image',
    video: process.env.GEMINI_VIDEO_MODEL || 'veo-3.1-generate-preview',
} as const;

export default ai;
