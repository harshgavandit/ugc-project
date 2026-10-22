export type GenerationErrorResponse = {
    status: number;
    message: string;
};

const getErrorText = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    try {
        return JSON.stringify(error);
    } catch {
        return '';
    }
};

const getErrorStatus = (error: unknown): number | undefined => {
    if (!error || typeof error !== 'object') {
        return undefined;
    }

    const candidate = error as { status?: unknown; code?: unknown };
    const status = Number(candidate.status ?? candidate.code);
    return Number.isFinite(status) ? status : undefined;
};

/**
 * Converts provider failures into concise, actionable responses without
 * returning provider payloads or internal stack details to the browser.
 */
export const toGenerationErrorResponse = (error: unknown): GenerationErrorResponse => {
    const errorText = getErrorText(error);
    const normalizedText = errorText.toLowerCase();
    const status = getErrorStatus(error);
    const code = (error && typeof error === 'object') ? (error as { code?: string }).code : undefined;
    if (code === 'provider_not_configured') {
        return { status: 503, message: 'Image generation is not configured. Set OPENAI_API_KEY on the backend Vercel project and redeploy. No credits were charged.' };
    }
    if (code === 'insufficient_quota' || code === 'billing_hard_limit_reached') {
        return { status: 503, message: 'OpenAI API billing or spending quota is exhausted. Check API billing and project limits. Your application credits were restored.' };
    }
    if (status === 401 || status === 403 || status === 404) {
        return { status: 503, message: 'OpenAI credentials or image-model access are unavailable. Check the backend API key, model access and organization verification. Your application credits were restored.' };
    }
    const isRateLimited = status === 429
        || normalizedText.includes('"code":429')
        || normalizedText.includes('resource_exhausted')
        || normalizedText.includes('quota exceeded');

    if (isRateLimited) {
        const requiresBilling = normalizedText.includes('free_tier_requests')
            && normalizedText.includes('limit: 0');

        if (requiresBilling) {
            return {
                status: 503,
                message: 'Google AI image generation is unavailable for this API project. Enable paid Gemini API billing, then try again. Your application credits were restored.',
            };
        }

        return {
            status: 429,
            message: 'The AI provider is currently rate-limited. Please retry later. Your application credits were restored.',
        };
    }

    return {
        status: 500,
        message: 'Image generation failed. Please try again. Your application credits were restored.',
    };
};
