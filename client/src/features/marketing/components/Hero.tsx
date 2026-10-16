import { ArrowRightIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import outputPreview from '../../../assets/generated1.png';

export default function Hero() {
    return <section id="home" className="relative z-10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-36 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="mb-5 text-sm text-indigo-300">Personal project by Harsh Gavand</p>
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">UGC Content Studio</h1>
                <p className="mb-8 max-w-lg leading-relaxed text-gray-300">Explore a workflow for creating product imagery from product and model references, then managing image and video projects. Live generation depends on configured provider access.</p>
                <div className="flex flex-wrap gap-4">
                    <Link reloadDocument to="/demo" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium">Explore sample workspace <ArrowRightIcon size={16} /></Link>
                    <Link to="/generate" className="rounded-full border border-white/15 px-6 py-3 text-sm">Open live generator</Link>
                </div>
                <p className="mt-5 text-sm text-gray-400">The public sample needs no sign-in. Live creation requires an account and configured services.</p>
            </motion.div>
            <figure className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/3">
                <img src={outputPreview} alt="Repository example of a model beside a travel suitcase" className="max-h-[520px] w-full object-cover object-top" />
                <figcaption className="p-4 text-sm text-gray-400">Existing gallery example · Illustrative output</figcaption>
            </figure>
        </div>
    </section>;
}
