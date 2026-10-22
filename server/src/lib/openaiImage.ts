type ImageInput = { bytes: Uint8Array; mimeType: string };
type Options = { apiKey?: string; model?: string; fetch?: typeof fetch };

export const requireImageProvider = (apiKey = process.env.OPENAI_API_KEY) => {
    if (!apiKey?.trim()) {
        throw Object.assign(new Error('Set OPENAI_API_KEY on the backend Vercel project.'), {
            status: 503, code: 'provider_not_configured',
        });
    }
    return apiKey.trim();
};

/** Uses image edits so both uploaded references actually condition the output. */
export const generateImage = async (
    input: { images: ImageInput[]; prompt: string; aspectRatio: string },
    options: Options = {},
): Promise<Buffer> => {
    const key = requireImageProvider(options.apiKey);
    const form = new FormData();
    form.set('model', options.model || process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1-mini');
    form.set('prompt', input.prompt);
    form.set('size', input.aspectRatio === '16:9' ? '1536x1024' : '1024x1536');
    form.set('quality', 'low');
    form.set('output_format', 'png');
    form.set('n', '1');
    for (const [index, image] of input.images.entries()) {
        const extension = image.mimeType === 'image/jpeg' ? 'jpg' : image.mimeType.split('/')[1];
        form.append('image[]', new Blob([new Uint8Array(image.bytes)], { type: image.mimeType }), `reference-${index}.${extension}`);
    }
    const response = await (options.fetch || fetch)('https://api.openai.com/v1/images/edits', {
        method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form,
        signal: AbortSignal.timeout(240_000),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw Object.assign(new Error(body.error?.message || 'OpenAI image request failed'), {
            status: response.status, code: body.error?.code,
        });
    }
    const body = await response.json();
    if (!body.data?.[0]?.b64_json) throw new Error('OpenAI returned no image');
    return Buffer.from(body.data[0].b64_json, 'base64');
};
