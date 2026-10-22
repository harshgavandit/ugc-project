import { useCallback, useEffect, useState } from "react";
import type { Project } from "../types";
import { ImageIcon, Loader2Icon, RefreshCwIcon, VideoIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GhostButton } from "../../../components/ui/Buttons";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../../../lib/apiClient";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../../lib/getErrorMessage";
import GenerationPreview from '../components/GenerationPreview';

const ResultPage = () => {
    const { projectId } = useParams();
    const { getToken } = useAuth();
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();

    const [project, setProjectData] = useState<Project>({} as Project);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchProjectData = useCallback(async () => {
        try {
            const token = await getToken();
            const { data } = await api.get(`/api/user/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjectData(data.project);
            setIsGenerating(data.project.isGenerating);
            setLoading(false);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
            console.log(error);
        }
    }, [getToken, projectId]);


    useEffect(() => {
        if (user && !project.id) {
            fetchProjectData();
        } else if (isLoaded && !user) {
            navigate("/");
        }
    }, [user, project.id, isLoaded, navigate, fetchProjectData]);

    // Fetch project every 10 seconds
    useEffect(() => {
        if (user && isGenerating) {
            const interval = setInterval(() => {
                fetchProjectData();
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [user, isGenerating, fetchProjectData]);

    return loading ? (
        <div className="h-screen w-full flex items-center justify-center">
            <Loader2Icon className="animate-spin text-indigo- size-9" />
        </div>
    ) : (
        <div className="min-h-screen  text-white p-6 md:p-12 mt-20">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-medium">Generation Result</h1>
                    <Link to="/generate" className="btn-secondary text-sm flex items-center gap-2">
                        <RefreshCwIcon className="w-4 h-4" />
                        <p className="max-sm:hidden'">New Generation</p>
                    </Link>
                </header>

                {/* grid layout  */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Result Display */}
                    <div className="lg:col-span-2 space-y-6">
                        <GenerationPreview project={project} />
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {/* download buttons  */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold mb-4">Actions</h3>
                            <div className="flex flex-col gap-3">
                                <a href={project.generatedImage?.replace("/upload", "/upload/fl_attachment")} download>
                                    <GhostButton disabled={!project.generatedImage} className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <ImageIcon className="size-4.5" />
                                        Download Image
                                    </GhostButton>
                                </a>
                                <a href={project.generatedVideo?.replace("/upload", "/upload/fl_attachment")} download>
                                    <GhostButton disabled={!project.generatedVideo} className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <VideoIcon className="size-4.5" />
                                        Download Video
                                    </GhostButton>
                                </a>
                            </div>
                        </div>

                        {/* generate video button  */}
                        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <VideoIcon className="size-24" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Video Magic</h3>
                            <p className="text-gray-400 text-sm mb-6">OpenAI has discontinued its video API. New video generation is unavailable; your saved videos remain accessible.</p>
                            {!project.generatedVideo ? (
                                <p role="status" className="text-sm text-amber-300">Video unavailable — no credits will be charged.</p>
                            ) : (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm font-medium">Video Generated Successfully!</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
