'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { RemotionPlayerWrapper } from '@/components/RemotionPlayer';
import { TimelineEditor } from '@/components/TimelineEditor';
import { Project, Timeline, ExportJob } from '@/types';
import { STOCK_TEMPLATES } from '@/config/templates';
import { Download, SlidersHorizontal, Layers, PlayCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
    const [project, setProject] = useState<Project | null>(null);
    const [isAligning, setIsAligning] = useState(false);
    const [activeJob, setActiveJob] = useState<ExportJob | null>(null);
    const [view, setView] = useState<'preview' | 'editor'>('preview');

    // Polling for job status
    useEffect(() => {
        let timer: any;
        if (activeJob && activeJob.status !== 'completed' && activeJob.status !== 'failed') {
            timer = setInterval(async () => {
                const res = await fetch(`/api/export?id=${activeJob.id}`);
                const data = await res.json();
                setActiveJob(data);
                if (data.status === 'completed' || data.status === 'failed') {
                    clearInterval(timer);
                }
            }, 3000);
        }
        return () => clearInterval(timer);
    }, [activeJob]);

    const handleAlign = async (audio: File, lyrics: string) => {
        setIsAligning(true);
        try {
            const formData = new FormData();
            formData.append('audio', audio);
            formData.append('lyrics', lyrics);
            formData.append('settings', JSON.stringify({
                useVocalIsolation: false,
                language: 'pt',
                wordLevelTiming: true,
                globalOffsetMs: 0
            }));

            const res = await fetch('/api/align', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.error) alert(data.error);
            else setProject(data);
        } catch (error) {
            alert('Erro ao processar alinhamento.');
        } finally {
            setIsAligning(false);
        }
    };

    const handleExport = async () => {
        if (!project) return;
        try {
            const res = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project.id, formats: ['mp4', 'srt'] })
            });
            const job = await res.json();
            setActiveJob(job);
        } catch (error) {
            alert('Erro ao iniciar exportação.');
        }
    };

    return (
        <main className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    onAlign={handleAlign} 
                    onTemplateChange={(t) => project && setProject({ ...project, template: t })}
                    isAligning={isAligning}
                />
                
                <section className="flex-1 flex flex-col bg-gray-950 relative">
                    {/* Toolbar */}
                    <div className="h-14 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
                        <div className="flex gap-4 text-sm font-medium">
                            <button 
                                onClick={() => setView('preview')}
                                className={`flex items-center gap-2 pb-4 h-14 mt-4 px-2 transition-all border-b-2 ${view === 'preview' ? 'text-purple-400 border-purple-600' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                <PlayCircle size={16} /> Preview
                            </button>
                            <button 
                                onClick={() => setView('editor')}
                                className={`flex items-center gap-2 pb-4 h-14 mt-4 px-2 transition-all border-b-2 ${view === 'editor' ? 'text-purple-400 border-purple-600' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                <SlidersHorizontal size={16} /> Timeline Editor
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {activeJob && (
                                <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
                                    {activeJob.status === 'processing' ? (
                                        <Loader2 size={14} className="animate-spin text-purple-400" />
                                    ) : activeJob.status === 'completed' ? (
                                        <CheckCircle2 size={14} className="text-green-500" />
                                    ) : null}
                                    <span className="text-[10px] uppercase font-bold tracking-tighter">
                                        Render {activeJob.status}
                                    </span>
                                </div>
                            )}

                            <button 
                                onClick={handleExport}
                                disabled={!project || (activeJob && (activeJob.status === 'queued' || activeJob.status === 'processing'))}
                                className="px-4 py-2 rounded-lg bg-white hover:bg-gray-200 text-black text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Download size={16} /> Export MP4
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex overflow-hidden">
                        <div className={`flex-1 ${view === 'editor' ? 'hidden' : 'block'}`}>
                            {project && (
                                <RemotionPlayerWrapper 
                                    audioUrl={project.audioPath}
                                    timeline={project.timeline}
                                    template={project.template}
                                />
                            )}
                        </div>

                        {view === 'editor' && project && (
                            <div className="flex-1 p-8 overflow-y-auto">
                                <TimelineEditor 
                                    timeline={project.timeline}
                                    currentTimeMs={0} // Mock
                                    onChange={(newTimeline) => setProject({ ...project, timeline: newTimeline })}
                                />
                            </div>
                        )}
                        
                        {!project && (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                                <Layers size={48} className="mb-4 opacity-20" />
                                <p>No project active</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
