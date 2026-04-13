'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { RemotionPlayerWrapper } from '@/components/RemotionPlayer';
import { TimelineEditor } from '@/components/TimelineEditor';
import { Project, Timeline, RenderJob, Template } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';
import { SlidersHorizontal, PlayCircle, Loader2, CheckCircle2, Wand2, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
    const [project, setProject] = useState<Project | null>(null);
    const [timeline, setTimeline] = useState<Timeline | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeJob, setActiveJob] = useState<RenderJob | null>(null);
    const [view, setView] = useState<'preview' | 'editor'>('preview');
    const [statusMsg, setStatusMsg] = useState('');
    
    // Preview-only template (for AI variants or unsaved drafts)
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshProject = useCallback(async (id: string, fullRefresh = false) => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            const updated = await res.json();
            setProject(updated);
            if (updated.timeline) setTimeline(updated.timeline);

            // Sync Preview Template if project changed its persistent selection
            if (fullRefresh && updated.selectedTemplateId) {
                const stock = TEMPLATES_REGISTRY.find(t => t.id === updated.selectedTemplateId);
                if (!stock) {
                    const tRes = await fetch(`/api/templates/${updated.selectedTemplateId}`);
                    if (tRes.ok) {
                        const tData = await tRes.json();
                        setPreviewTemplate(tData);
                    }
                } else {
                    setPreviewTemplate(null);
                }
            }
        } catch (err) {
            console.error('Failed to refresh project:', err);
        }
    }, []);

    useEffect(() => {
        let interval: any;
        if (activeJob && !['completed', 'failed'].includes(activeJob.status)) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/jobs/${activeJob.id}`);
                    const updatedJob = await res.json();
                    setActiveJob(updatedJob);

                    if (updatedJob.status === 'completed') {
                        clearInterval(interval);
                        if (project) await refreshProject(project.id, true);
                    } else if (updatedJob.status === 'failed') {
                        clearInterval(interval);
                        alert(`Job failed: ${updatedJob.errorMessage}`);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [activeJob, project, refreshProject]);

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
        setStatusMsg('Processing creative assets...');
        try {
            const formData = new FormData();
            formData.append('audio', e.target.files[0]);
            const res = await fetch(`/api/projects/${project.id}/upload-audio`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error('Upload failed');
            const updatedProject = await res.json();
            setProject(updatedProject);
            handleAlign(updatedProject.id);
        } catch (error: any) {
            alert(`Upload failed: ${error.message}`);
            setIsProcessing(false);
        }
    };

    const handleAlign = async (id: string) => {
        setIsProcessing(true);
        setStatusMsg('Syncing Neural Alignment...');
        try {
            const res = await fetch(`/api/projects/${id}/align`, { method: 'POST' });
            const job = await res.json();
            setActiveJob(job);
        } catch (error: any) {
            alert('Alignment error: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExport = async () => {
        if (!project) return;
        setStatusMsg('Initializing Render Node...');
        try {
            const res = await fetch(`/api/projects/${project.id}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    formats: ['mp4'], 
                    // If preview matches persistent, worker pulls from DB, else we pass draft
                    customTemplate: previewTemplate?.id === project.selectedTemplateId ? undefined : previewTemplate 
                })
            });
            const job = await res.json();
            setActiveJob(job);
        } catch (error) {
            alert('Export failed');
        }
    };

    const handleTemplateSelect = async (t: Template) => {
        setPreviewTemplate(t);
        if (project) {
            try {
                const res = await fetch(`/api/projects/${project.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ selectedTemplateId: t.id })
                });
                const updated = await res.json();
                setProject(updated);
            } catch (err) {
                console.error('Failed to persist selection');
            }
        }
    };

    const activeTemplate = previewTemplate || (project ? TEMPLATES_REGISTRY.find(t => t.id === project.selectedTemplateId) : null);

    return (
        <div className="flex flex-col h-screen bg-black text-white selection:bg-purple-500/30 font-sans">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    onProjectCreate={handleCreateProject} 
                    onTemplateSelect={handleTemplateSelect}
                    activeTemplateId={project?.selectedTemplateId}
                    currentTemplate={activeTemplate || undefined}
                />
                
                <section className="flex-1 flex flex-col bg-zinc-950 relative shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="audio/*" />

                    {/* V3 Glass Toolbar */}
                    <div className="h-16 border-b border-white/5 bg-zinc-950/20 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 z-10">
                        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            <button onClick={() => setView('preview')} className={`flex items-center gap-3 h-16 border-b-2 transition-all group ${view === 'preview' ? 'text-white border-white' : 'border-transparent hover:text-zinc-300'}`}>
                                <PlayCircle size={16} className={view === 'preview' ? 'text-purple-500' : 'group-hover:text-zinc-400'} /> Preview Engine
                            </button>
                            <button onClick={() => setView('editor')} className={`flex items-center gap-3 h-16 border-b-2 transition-all ${view === 'editor' ? 'text-white border-white' : 'border-transparent hover:text-zinc-300'}`}>
                                <SlidersHorizontal size={16} className={view === 'editor' ? 'text-purple-500' : ''} /> Timeline Console
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-8">
                            {(isProcessing || (activeJob && !['completed', 'failed'].includes(activeJob.status))) && (
                                <div className="flex items-center gap-4 px-5 py-2 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                                    <Loader2 size={14} className="animate-spin text-purple-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-purple-400">
                                        {activeJob && activeJob.status === 'processing' ? `${activeJob.type}: ${activeJob.progress}%` : statusMsg}
                                    </span>
                                </div>
                            )}

                            {activeJob?.status === 'completed' && activeJob.type === 'render' && (
                                <a href={activeJob.outputPath} download className="flex items-center gap-4 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/5">
                                    <CheckCircle2 size={14} /> Production Ready
                                </a>
                            )}

                            <button onClick={handleExport} disabled={!project || project.status !== 'ready' || isProcessing} className="px-8 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 flex items-center gap-3 shadow-2xl shadow-white/10 active:scale-95">
                                Final Master
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        <div className={`flex-[1.8] relative ${view === 'editor' ? 'hidden md:block' : 'block'} p-8`}>
                            {project && timeline && activeTemplate ? (
                                <div className="w-full h-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-black">
                                    <RemotionPlayerWrapper 
                                        audioSrc={`/api/projects/${project.id}/audio`}
                                        timeline={timeline}
                                        template={activeTemplate}
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-8 text-zinc-900">
                                    <div className="relative">
                                        <div className="w-40 h-40 bg-zinc-900/20 rounded-full flex items-center justify-center border border-zinc-900/50 animate-pulse">
                                            <Wand2 size={64} className="opacity-10" />
                                        </div>
                                        <div className="absolute inset-0 border-2 border-dashed border-zinc-800/20 rounded-full animate-[spin_20s_linear_infinite]"/>
                                    </div>
                                    <div className="text-center group">
                                        <h2 className="text-zinc-600 font-black text-xs uppercase tracking-[0.3em] mb-3 group-hover:text-zinc-400 transition-colors">Awaiting Production Input</h2>
                                        <p className="max-w-xs text-[10px] font-bold text-zinc-800 uppercase tracking-widest leading-relaxed">Initialize a workspace to engage the Art Director AI.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {view === 'editor' && timeline && (
                            <div className="flex-1 p-8 border-l border-white/5 bg-zinc-950 animate-in slide-in-from-right duration-700">
                                <TimelineEditor timeline={timeline} currentTimeMs={0} onChange={(newTimeline) => setTimeline(newTimeline)} />
                            </div>
                        )}
                    </div>

                    <footer className="h-12 px-10 border-t border-white/5 bg-zinc-950 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-zinc-700">
                        <div className="flex gap-10">
                            <span className="flex items-center gap-2">Project • <span className="text-zinc-400">{project?.title || 'Inactive'}</span></span>
                            {activeTemplate && (
                                <span className="flex items-center gap-2 text-purple-500/80">
                                    <ShieldCheck size={12}/> {activeTemplate.name} 
                                    <span className="text-zinc-800 tracking-tighter ml-2">V{activeTemplate.metadata?.version || 1}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 opacity-50">
                            <span>Engine v4.0.0 Pro</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                        </div>
                    </footer>
                </section>
            </div>
        </div>
    );
}
