import { useReducer } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCcw, TriangleAlert } from 'lucide-react';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import UploadZone from '../../components/ui/UploadZone';
import GenerationPreview from '../generation/components/GenerationPreview';
import Footer from '../../components/layout/Footer';
import { initialDemoState, transitionDemo } from './demoState.mjs';
import { sampleProject } from './sampleProject';

export default function DemoPage() {
    const [state, dispatch] = useReducer(transitionDemo, initialDemoState);
    const fieldClass = 'mt-2 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200';
    return <>
        <nav aria-label="Sample workspace navigation" className="border-b border-white/10 px-5 py-5">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
                <Link reloadDocument to="/" className="font-semibold">UGC Content Studio</Link>
                <div className="flex gap-5 text-sm text-gray-300"><a href="https://github.com/harshgavandit/ugc-project">View source</a><a href="/generate">Open live generator</a></div>
            </div>
        </nav>
        <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
            <p className="mb-3 text-sm font-medium text-indigo-300">Personal project by Harsh Gavand · Public sample workspace</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Explore the content workflow</h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-gray-300">Try the reference setup, inspect a saved output example, and walk through an error recovery. Every record here is synthetic; images are existing repository examples. Nothing is uploaded, generated, published, or saved to an account.</p>
            <div className="my-7 flex flex-wrap gap-3 text-xs text-indigo-200"><span className="rounded-full border border-indigo-400/25 bg-indigo-400/10 px-3 py-2">Read-only sample data</span><span className="rounded-full border border-white/10 px-3 py-2">No sign-in or provider connection</span></div>
            <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section aria-labelledby="setup-heading" className="rounded-2xl border border-white/10 bg-white/3 p-5 md:p-7">
                    <h2 id="setup-heading" className="text-xl font-semibold">1. Set up references</h2>
                    <p className="mb-5 mt-2 text-sm text-gray-400">The live generator accepts a product image and model image. Use the supplied public samples to explore the same reference UI.</p>
                    {state.referencesReady ? <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        <UploadZone label="Product Image" file={null} onClear={() => {}} onChange={() => {}} samplePreview={{ src: sampleProject.uploadedImages[0], name: 'Product reference' }} />
                        <UploadZone label="Model Image" file={null} onClear={() => {}} onChange={() => {}} samplePreview={{ src: sampleProject.uploadedImages[1], name: 'Model reference' }} />
                    </div> : <div className="mb-6 rounded-xl border border-dashed border-white/20 p-8 text-center"><p className="mb-4 text-sm text-gray-300">Product + model references</p><PrimaryButton onClick={() => dispatch('load-references')}>Use sample references</PrimaryButton></div>}
                    <div className="space-y-4">
                        <label className="block text-sm">Project Name<input readOnly value={sampleProject.name} className={fieldClass} /></label>
                        <label className="block text-sm">Product Name<input readOnly value={sampleProject.productName} className={fieldClass} /></label>
                        <label className="block text-sm">User Prompt<textarea readOnly value={sampleProject.userPrompt} rows={3} className={fieldClass} /></label>
                        <p className="text-sm text-gray-400">Aspect ratio: <span className="text-white">9:16 · Portrait</span></p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <PrimaryButton disabled={!state.referencesReady} className="disabled:opacity-40" onClick={() => dispatch('show-output')}>View saved sample</PrimaryButton>
                        <GhostButton disabled={!state.referencesReady} className="disabled:opacity-40" onClick={() => dispatch('show-error')}>Explore provider error</GhostButton>
                    </div>
                </section>
                <section aria-labelledby="output-heading" className="rounded-2xl border border-white/10 bg-white/3 p-5 md:p-7">
                    <h2 id="output-heading" className="text-xl font-semibold">2. Inspect output & recovery</h2>
                    <div aria-live="polite" className="mt-5">
                        {state.view === 'setup' && <div className="rounded-xl border border-white/10 p-7 text-gray-300"><p className="font-medium">Ready when you are</p><p className="mt-3 text-sm leading-relaxed">Load the references, then choose a saved sample or the error scenario. These controls reveal examples without calling the generation service.</p></div>}
                        {state.view === 'saved' && <>
                            <p className="mb-4 flex items-center gap-2 text-sm text-green-300"><CheckCircle2 size={18} />Saved output · Synthetic project record</p>
                            <GenerationPreview project={sampleProject} />
                            <p className="mt-4 text-sm text-gray-300">{sampleProject.name}</p>
                            <p className="mt-2 text-xs leading-relaxed text-gray-400">Sample ID: {sampleProject.id}. This pre-existing gallery asset illustrates the result screen; it is not a live generation or proof of reference matching.</p>
                            <a href={sampleProject.generatedImage} download="ugc-sample-travel.png" className="mt-4 inline-block text-sm text-indigo-300 underline">Download sample image</a>
                        </>}
                        {state.view === 'error' && <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-6" role="alert">
                            <TriangleAlert className="mb-3 text-amber-300" /><h3 className="font-semibold">Provider rate limit · Simulated</h3>
                            <p className="mt-3 text-sm leading-relaxed text-gray-300">The live service can return: “Google AI is currently rate-limited. Please retry later. Your application credits were restored.”</p>
                            <p className="mt-3 text-sm leading-relaxed text-gray-400">Your sample references remain visible. In the live app, retry generation when provider capacity returns. Here, retry opens the bundled saved example; no credits or provider request are involved.</p>
                            <PrimaryButton className="mt-5" onClick={() => dispatch('retry')}>Retry sample scenario</PrimaryButton>
                        </div>}
                    </div>
                    <GhostButton className="mt-6" onClick={() => dispatch('reset')}><RotateCcw size={15} /> Reset walkthrough</GhostButton>
                </section>
            </div>
            <section id="project-context" className="mt-10 max-w-3xl text-sm leading-relaxed text-gray-400"><h2 className="mb-2 font-semibold text-white">About this personal project</h2><p>The authenticated application uses Clerk, Express, Prisma, Google AI and Cloudinary. Live generation requires an account and configured services. The sample route runs independently and does not access private projects. Asset provenance is documented in the repository.</p></section>
        </main>
        <Footer />
    </>;
}
