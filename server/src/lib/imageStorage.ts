/** Preserve images in the existing PostgreSQL text fields if media storage is down. */
export const storeImage = async (
    bytes: Buffer,
    mimeType: string,
    upload: (dataUrl: string) => Promise<{ secure_url: string }>,
): Promise<string> => {
    const dataUrl = `data:${mimeType};base64,${bytes.toString('base64')}`;
    try {
        const result = await upload(dataUrl);
        if (result.secure_url) return result.secure_url;
    } catch {
        // The database remains the durable store; never discard output after inference.
        console.warn('image_storage_fallback: storing image in project database');
    }
    return dataUrl;
};
