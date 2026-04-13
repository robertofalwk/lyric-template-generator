'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { RemotionPlayerWrapper } from '@/components/RemotionPlayer';
import { TimelineEditor } from '@/components/TimelineEditor';
import { Project, Timeline, RenderJob, Template } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';
import { SlidersHorizontal, PlayCircle, Loader2, CheckCircle2, Wand2, ShieldCheck, Box } from 'lucide-react';

export default function Dashboard() {
    const [project, setProject] = useState<Project | null>(null);
    const [timeline, setTimeline] = useState<Timeline | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeJob, setActiveJob] = useState<RenderJob | null>(null);
    const [view, setView] = useState<'preview' | 'editor'>('preview');
    const [statusMsg, setStatusMsg] = useState('');
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshProject = useCallback(async (id: string, fullRefresh = false) => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            const updated = await res.json();
            setProject(updated);
            if (updated.timeline) setTimeline(updated.timeline);

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
            console.error('Refresh fail:', err);
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
                    }
                } catch (err) { console.error('Polling error:', err); }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [activeJob, project, refreshProject]);

    const handleCreateProject = async (title: string, lyrics: string) => {
        setIsProcessing(true);
        setStatusMsg('Initializing Creative Node...');
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, lyrics })
            });
            const newProject = await res.json();
            setProject(newProject);
            fileInputRef.current?.click();
        } catch (error) { alert('Project creation failed'); } finally { setIsProcessing(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!project || !e.target.files?.[0]) return;
        setIsProcessing(true);
        setStatusMsg('Ingesting Assets...');
        try {
            const formData = new FormData();
            formData.append('audio', e.target.files[0]);
            const res = await fetch(`/api/projects/${project.id}/upload-audio`, {
                method: 'POST',
                body: formData
            });
            const updatedProject = await res.json();
            setProject(updatedProject);
            handleAlign(updatedProject.id);
        } catch (error: any) { alert(`Ingestion failed: ${error.message}`); setIsProcessing(false); }
    };

    const handleAlign = async (id: string) => {
        setIsProcessing(true);
        setStatusMsg('Sincronizing Neural Network...');
        try {
            const res = await fetch(`/api/projects/${id}/align`, { method: 'POST' });
            const job = await res.json();
            setActiveJob(job);
        } catch (error: any) { alert('Alignment error: ' + error.message); } finally { setIsProcessing(false); }
    };

    const handleExport = async () => {
        if (!project) return;
        setStatusMsg('Final Mastering Sequence...');
        try {
            const res = await fetch(`/api/projects/${project.id}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    formats: ['mp4'], 
                    customTemplate: previewTemplate?.id === project.selectedTemplateId ? undefined : previewTemplate 
                })
            });
            const job = await res.json();
            setActiveJob(job);
        } catch (error) { alert('Mastering failed'); }
    };

    const handleTemplateSelect = async (t: Template) => {
        setPreviewTemplate(t);
        if (project) {
            try {
                // PATCH Project with V4 Visual Snapshot Data
                const res = await fetch(`/api/projects/${project.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        selectedTemplateId: t.id,
                        selectedBackgroundAssetId: t.backgroundAssetId,
                        lastVisualScore: t.metadata?.qualityScore 
                    })
                });
                const updated = await res.json();
                setProject(updated);
            } catch (err) { console.error('Visual snapshot failed'); }
        }
    };

    const activeTemplate = previewTemplate || (project ? TEMPLATES_REGISTRY.find(t => t.id === project.selectedTemplateId) : null);

    return (
        <div className="flex flex-col h-screen bg-black text-white selection:bg-purple-500/30 font-sans tracking-tight">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    onProjectCreate={handleCreateProject} 
                    onTemplateSelect={handleTemplateSelect}
                    activeTemplateId={project?.selectedTemplateId}
                    currentTemplate={activeTemplate || undefined}
                />
                
                <section className="flex-1 flex flex-col bg-zinc-950 relative shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="audio/*" />

                    <div className="h-16 border-b border-white/5 bg-zinc-950/30 backdrop-blur-3xl flex items-center justify-between px-10 shrink-0 z-10">
                        <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                            <button onClick={() => setView('preview')} className={`flex items-center gap-3 h-16 border-b-2 transition-all group ${view === 'preview' ? 'text-white border-white' : 'border-transparent hover:text-zinc-400'}`}>
                                <PlayCircle size={14} className={view === 'preview' ? 'text-purple-500' : 'group-hover:text-zinc-500'} /> Monitoring
                            </button>
                            <button onClick={() => setView('editor')} className={`flex items-center gap-3 h-16 border-b-2 transition-all ${view === 'editor' ? 'text-white border-white' : 'border-transparent hover:text-zinc-400'}`}>
                                <SlidersHorizontal size={14} className={view === 'editor' ? 'text-purple-500' : ''} /> Production
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-8">
                            {(isProcessing || (activeJob && !['completed', 'failed'].includes(activeJob.status))) && (
                                <div className="flex items-center gap-4 px-6 py-2 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/10 rounded-[1.5rem]">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"/>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                                        {activeJob?.status === 'processing' ? `${activeJob.type} master: ${activeJob.progress}%` : statusMsg}
                                    </span>
                                </div>
                            )}

                            {activeJob?.status === 'completed' && activeJob.type === 'render' && (
                                <a href={activeJob.outputPath} download className="flex items-center gap-4 px-8 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/10">
                                    <CheckCircle2 size={16} /> Final Master Export
                                </a>
                            )}

                            <button onClick={handleExport} disabled={!project || project.status !== 'ready' || isProcessing} className="px-10 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20 flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] active:scale-95">
                                Master Production
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-8 gap-8">
                        <div className={`flex-[2] relative ${view === 'editor' ? 'hidden md:block' : 'block'}`}>
                            {project && timeline && activeTemplate ? (
                                <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/5 border-b-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] bg-black ring-1 ring-white/5">
                                    <RemotionPlayerWrapper 
                                        audioSrc={`/api/projects/${project.id}/audio`}
                                        timeline={timeline}
                                        template={activeTemplate}
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-12 text-zinc-900 border-2 border-dashed border-zinc-900/20 rounded-[3rem]">
                                    <Box size={80} className="opacity-10" />
                                    <div className="text-center">
                                        <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-4 text-zinc-700">Awaiting High-Fidelity Signal</p>
                                        <p className="max-w-xs text-[10px] text-zinc-900 font-bold uppercase tracking-widest opacity-20">Initialize workspace to engage masters.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {view === 'editor' && timeline && (
                            <div className="flex-1 p-10 rounded-[2.5rem] border border-white/5 bg-zinc-950 shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto custom-scrollbar">
                                <TimelineEditor timeline={timeline} currentTimeMs={0} onChange={(newTimeline) => setTimeline(newTimeline)} />
                            </div>
                        )}
                    </div>

                    <footer className="h-16 px-12 border-t border-white/5 bg-zinc-950 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] text-zinc-700">
                        <div className="flex gap-12">
                            <span className="flex items-center gap-3">Signal • <span className="text-zinc-500">{project?.title || 'None'}</span></span>
                            {activeTemplate && (
                                <span className="flex items-center gap-3 text-purple-600/80">
                                    <ShieldCheck size={14}/> {activeTemplate.name} 
                                    <span className="text-[9px] bg-zinc-900 text-zinc-800 px-2 py-0.5 rounded ml-2">V{activeTemplate.metadata?.version || 1}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex gap-8 items-center opacity-30">
                            <span>Engine v5.2 Studio Master</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500"/>
                        </div>
                    </footer>
                </section>
            </div>
        </div>
    );
}
