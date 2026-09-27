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
 * returning Google SDK payloads or internal stack details to the browser.
 */
export const toGenerationErrorResponse = (error: unknown): GenerationErrorResponse => {
    const errorText = getErrorText(error);
    const normalizedText = errorText.toLowerCase();
    const status = getErrorStatus(error);
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
            message: 'Google AI is currently rate-limited. Please retry later. Your application credits were restored.',
        };
    }

    return {
        status: 500,
        message: 'Image generation failed. Please try again. Your application credits were restored.',
    };
};
