import axios from 'axios';

type ApiErrorPayload = {
    message?: string;
};

/** Returns the API-provided message when available, with a safe generic fallback. */
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
        return error.response?.data?.message || error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
}
