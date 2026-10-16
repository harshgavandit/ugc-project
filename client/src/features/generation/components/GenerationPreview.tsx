import type { Project } from '../types';

// Shared by authenticated results and the public, bundled sample workspace.
export default function GenerationPreview({ project }: { project: Project }) {
    return <div className="glass-panel inline-block p-2 rounded-2xl w-full">
        <div className={`${project.aspectRatio === '9:16' ? 'aspect-9/16' : 'aspect-video'} sm:max-h-200 rounded-xl bg-gray-900 overflow-hidden relative`}>
            {project.generatedVideo
                ? <video src={project.generatedVideo} controls autoPlay loop className="w-full h-full object-cover" />
                : <img src={project.generatedImage} alt={`${project.productName} — output preview`} className="w-full h-full object-cover" />}
        </div>
    </div>;
}
