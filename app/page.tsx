'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { RemotionPlayerWrapper } from '@/components/RemotionPlayer';
import { TimelineEditor } from '@/components/TimelineEditor';
import { Project, Timeline, RenderJob, Template } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';
import { Download, SlidersHorizontal, Layers, PlayCircle, Loader2, CheckCircle2, Wand2, Info } from 'lucide-react';

export default function Dashboard() {
    const [project, setProject] = useState<Project | null>(null);
    const [timeline, setTimeline] = useState<Timeline | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeJob, setActiveJob] = useState<RenderJob | null>(null);
    const [view, setView] = useState<'preview' | 'editor'>('preview');
    const [statusMsg, setStatusMsg] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Polling for job status
    useEffect(() => {
        let timer: any;
        if (activeJob && activeJob.status !== 'completed' && activeJob.status !== 'failed') {
            timer = setInterval(async () => {
                const res = await fetch(`/api/jobs/${activeJob.id}`);
                const data = await res.json();
                setActiveJob(data);
                if (data.status === 'completed' || data.status === 'failed') {
                    clearInterval(timer);
                }
            }, 3000);
        }
        return () => clearInterval(timer);
    }, [activeJob]);

    const handleCreateProject = async (title: string, lyrics: string) => {
        setIsProcessing(true);
        setStatusMsg('Initializing project...');
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, lyrics })
            });
            const newProject = await res.json();
            setProject(newProject);
            
            // Trigger file upload prompt
            fileInputRef.current?.click();
        } catch (error) {
            alert('Failed to create project');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!project || !e.target.files?.[0]) return;
        
        setIsProcessing(true);
        setStatusMsg('Uploading audio essence...');
        try {
            const formData = new FormData();
            formData.append('audio', e.target.files[0]);

            const res = await fetch(`/api/projects/${project.id}/upload-audio`, {
                method: 'POST',
                body: formData
            });
            const updatedProject = await res.json();
            setProject(updatedProject);
            
            // Start alignment automatically after upload
            handleAlign(updatedProject.id);
        } catch (error) {
            alert('Upload failed');
            setIsProcessing(false);
        }
    };

    const handleAlign = async (id: string) => {
        setIsProcessing(true);
        setStatusMsg('AI Sincronization in progress...');
        try {
            const res = await fetch(`/api/projects/${id}/align`, { method: 'POST' });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            setProject(data.project);
            setTimeline(data.timeline);
            setView('preview');
        } catch (error: any) {
            alert('Alignment error: ' + error.message);
        } finally {
            setIsProcessing(false);
            setStatusMsg('');
        }
    };

    const handleExport = async () => {
        if (!project) return;
        try {
            const res = await fetch(`/api/projects/${project.id}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formats: ['mp4', 'srt'] })
            });
            const job = await res.json();
            setActiveJob(job);
        } catch (error) {
            alert('Export failed');
        }
    };

    const activeTemplate = project ? TEMPLATES_REGISTRY.find(t => t.id === project.selectedTemplateId) : null;

    return (
        <div className="flex flex-col h-screen bg-black text-white selection:bg-purple-500/30">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    onProjectCreate={handleCreateProject} 
                    onTemplateSelect={(t) => project && setProject({ ...project, selectedTemplateId: t.id })}
                    activeTemplateId={project?.selectedTemplateId}
                />
                
                <section className="flex-1 flex flex-col bg-zinc-950 relative">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="audio/*" />

                    {/* Pro Toolbar */}
                    <div className="h-14 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
                        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            <button 
                                onClick={() => setView('preview')}
                                className={`flex items-center gap-2 h-14 border-b-2 transition-all ${view === 'preview' ? 'text-white border-white' : 'border-transparent hover:text-zinc-300'}`}
                            >
                                <PlayCircle size={14} className={view === 'preview' ? 'text-purple-500' : ''} /> Preview Engine
                            </button>
                            <button 
                                onClick={() => setView('editor')}
                                className={`flex items-center gap-2 h-14 border-b-2 transition-all ${view === 'editor' ? 'text-white border-white' : 'border-transparent hover:text-zinc-300'}`}
                            >
                                <SlidersHorizontal size={14} className={view === 'editor' ? 'text-purple-500' : ''} /> Timeline Editor
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            {isProcessing && (
                                <div className="flex items-center gap-3 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                    <Loader2 size={12} className="animate-spin text-purple-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-purple-400">{statusMsg}</span>
                                </div>
                            )}

                            {activeJob && (
                                <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer group">
                                    {activeJob.status === 'processing' ? (
                                        <div className="relative w-3 h-3">
                                            <Loader2 size={12} className="animate-spin text-purple-500 absolute inset-0" />
                                        </div>
                                    ) : activeJob.status === 'completed' ? (
                                        <CheckCircle2 size={12} className="text-green-500" />
                                    ) : <Info size={12} className="text-zinc-500" />}
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400 group-hover:text-white">
                                        Export: {activeJob.status} ({activeJob.progress}%)
                                    </span>
                                </div>
                            )}

                            <button 
                                onClick={handleExport}
                                disabled={!project || isProcessing}
                                className="px-6 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 flex items-center gap-2 shadow-xl shadow-white/5 active:scale-95"
                            >
                                <Download size={14} /> Render Video
                            </button>
                        </div>
                    </div>

                    {/* Editor Hub */}
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        <div className={`flex-[1.5] relative ${view === 'editor' ? 'hidden md:block' : 'block'}`}>
                            {project && timeline && activeTemplate ? (
                                <RemotionPlayerWrapper 
                                    audioUrl={project.audioOriginalPath}
                                    timeline={timeline}
                                    template={activeTemplate}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-zinc-800 p-12">
                                    <div className="w-32 h-32 bg-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-800/50">
                                        <Wand2 size={48} className="opacity-20" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-zinc-500 font-bold mb-2">Ready to create magic?</h2>
                                        <p className="max-w-xs text-xs leading-relaxed opacity-40">Create a project on the left, upload your audio, and let our AI engine handle the sync for you.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {view === 'editor' && timeline && (
                            <div className="flex-1 p-6 border-l border-white/5 bg-black/20 animate-in slide-in-from-right duration-500">
                                <TimelineEditor 
                                    timeline={timeline}
                                    currentTimeMs={0} // To be synced with player
                                    onChange={(newTimeline) => setTimeline(newTimeline)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Context Status Bar */}
                    <footer className="h-10 px-8 border-t border-white/5 bg-zinc-950 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                        <div className="flex gap-6">
                            <span>Project: {project?.title || 'None'}</span>
                            <span>Status: {project?.status || 'Idle'}</span>
                        </div>
                        <div className="flex gap-6 items-center">
                            <span>Engine: V4.0.2</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span>System Healthy</span>
                        </div>
                    </footer>
                </section>
            </div>
        </div>
    );
}
