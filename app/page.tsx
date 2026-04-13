'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { RemotionPlayerWrapper } from '@/components/RemotionPlayer';
import { TimelineEditor } from '@/components/TimelineEditor';
import { Project, Timeline, RenderJob, Template } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';
import { Download, SlidersHorizontal, PlayCircle, Loader2, CheckCircle2, Wand2 } from 'lucide-react';

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

            // Fetch the actual template object if it's not a stock one
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
        setStatusMsg('Uploading audio essence...');
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
        setStatusMsg('Queueing AI Sincronization...');
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
        setStatusMsg('Queueing Render...');
        try {
            // Important: We send the current previewTemplate if it exists and matches the ID
            // or the worker pulls it from DB using project.selectedTemplateId
            const res = await fetch(`/api/projects/${project.id}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    formats: ['mp4'], 
                    customTemplate: previewTemplate?.id === project.selectedTemplateId ? previewTemplate : undefined 
                })
            });
            const job = await res.json();
            setActiveJob(job);
        } catch (error) {
            alert('Export failed');
        }
    };

    const handleTemplateSelect = async (t: Template) => {
        // Just for active UI/preview
        setPreviewTemplate(t);

        // Persist to project if it exists in DB/Registry
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
                console.error('Failed to sync project template');
            }
        }
    };

    const activeTemplate = previewTemplate || (project ? TEMPLATES_REGISTRY.find(t => t.id === project.selectedTemplateId) : null);

    return (
        <div className="flex flex-col h-screen bg-black text-white selection:bg-purple-500/30">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    onProjectCreate={handleCreateProject} 
                    onTemplateSelect={handleTemplateSelect}
                    activeTemplateId={project?.selectedTemplateId}
                    currentTemplate={activeTemplate || undefined}
                />
                
                <section className="flex-1 flex flex-col bg-zinc-950 relative">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="audio/*" />

                    {/* Pro Toolbar */}
                    <div className="h-14 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
                        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            <button onClick={() => setView('preview')} className={`flex items-center gap-2 h-14 border-b-2 transition-all ${view === 'preview' ? 'text-white border-white' : 'border-transparent hover:text-zinc-300'}`}>
                                <PlayCircle size={14} className={view === 'preview' ? 'text-purple-500' : ''} /> Preview Engine
                            </button>
                            <button onClick={() => setView('editor')} className={`flex items-center gap-2 h-14 border-b-2 transition-all ${view === 'editor' ? 'text-white border-white' : 'border-transparent hover:text-zinc-300'}`}>
                                <SlidersHorizontal size={14} className={view === 'editor' ? 'text-purple-500' : ''} /> Timeline Editor
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            {(isProcessing || (activeJob && !['completed', 'failed'].includes(activeJob.status))) && (
                                <div className="flex items-center gap-3 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                    <Loader2 size={12} className="animate-spin text-purple-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-purple-400">
                                        {activeJob && activeJob.status === 'processing' ? `${activeJob.type.toUpperCase()}: ${activeJob.progress}%` : statusMsg}
                                    </span>
                                </div>
                            )}

                            {activeJob?.status === 'completed' && activeJob.type === 'render' && (
                                <a href={activeJob.outputPath} download className="flex items-center gap-3 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 hover:bg-green-500/20 transition-all text-[9px] font-black uppercase tracking-widest">
                                    Download MP4
                                </a>
                            )}

                            <button onClick={handleExport} disabled={!project || project.status !== 'ready' || isProcessing} className="px-6 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 flex items-center gap-2 shadow-xl shadow-white/5 active:scale-95">
                                Render Video
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        <div className={`flex-[1.5] relative ${view === 'editor' ? 'hidden md:block' : 'block'}`}>
                            {project && timeline && activeTemplate ? (
                                <RemotionPlayerWrapper 
                                    audioSrc={`/api/projects/${project.id}/audio`}
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
                                        <p className="max-w-xs text-xs leading-relaxed opacity-40">Create a project on the left and use the Art Director on the Design tab to generate unique visuals.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {view === 'editor' && timeline && (
                            <div className="flex-1 p-6 border-l border-white/5 bg-black/20 animate-in slide-in-from-right duration-500">
                                <TimelineEditor timeline={timeline} currentTimeMs={0} onChange={(newTimeline) => setTimeline(newTimeline)} />
                            </div>
                        )}
                    </div>

                    <footer className="h-10 px-8 border-t border-white/5 bg-zinc-950 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                        <div className="flex gap-6">
                            <span>Project: {project?.title || 'None'}</span>
                            {activeTemplate && <span className="text-purple-500">Active: {activeTemplate.name} {activeTemplate.metadata?.sourceType !== 'stock' ? '(Custom)' : ''}</span>}
                        </div>
                        <span>Art Director Engine v2.0 (Stable)</span>
                    </footer>
                </section>
            </div>
        </div>
    );
}
