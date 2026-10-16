import type { Project } from '../generation/types';
import productReference from '../../assets/product7.png';
import modelReference from '../../assets/model1.png';
import outputPreview from '../../assets/generated1.png';

// Public repository assets, curated for a fictional project. This is not a database record
// or a claim that these references were used for a verified provider request.
export const sampleProject: Project = {
    id: 'sample-travel-001',
    name: 'Travel essentials — sample project',
    productName: 'Blue travel suitcase',
    productDescription: 'Synthetic brief: a studio lifestyle image for a travel campaign.',
    userPrompt: 'Show the suitcase beside a model against a neutral studio background.',
    aspectRatio: '9:16',
    generatedImage: outputPreview,
    uploadedImages: [productReference, modelReference],
    isGenerating: false,
    isPublished: false,
    createdAt: '2026-01-01T12:00:00Z',
};
