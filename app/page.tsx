'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { RemotionPlayerWrapper } from '@/components/RemotionPlayer';
import { TimelineEditor } from '@/components/TimelineEditor';
import { Project, Timeline, RenderJob, Template } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';
import { 
    SlidersHorizontal, PlayCircle, Loader2, CheckCircle2, 
    Wand2, ShieldCheck, Box, Settings, LayoutGrid, 
    Search, FolderOpen, AlertCircle, Plus, Activity
} from 'lucide-react';

export default function Dashboard() {
    const [view, setView] = useState<'hub' | 'preview' | 'editor' | 'settings'>('hub');
    const [project, setProject] = useState<Project | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [timeline, setTimeline] = useState<Timeline | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeJob, setActiveJob] = useState<RenderJob | null>(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
    const [health, setHealth] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchHealth = async () => {
        try {
            const res = await fetch('/api/health');
            const data = await res.json();
            setHealth(data);
        } catch (e) {}
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setProjects(data);
        } catch (e) {}
    };

    useEffect(() => {
        fetchHealth();
        fetchProjects();
    }, []);

    const loadProject = async (id: string) => {
        setIsProcessing(true);
        setStatusMsg('Hydrating Studio Workspace...');
        try {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            setProject(data);
            if (data.timeline) setTimeline(data.timeline);
            
            if (data.selectedTemplateId) {
                const stock = TEMPLATES_REGISTRY.find(t => t.id === data.selectedTemplateId);
                if (stock) {
                    setActiveTemplate(stock);
                } else {
                    const tRes = await fetch(`/api/templates/${data.selectedTemplateId}`);
                    if (tRes.ok) setActiveTemplate(await tRes.json());
                }
            }
            setView('preview');
        } catch (e) { alert('Hydration Error'); } finally { setIsProcessing(false); }
    };

    const handleCreateProject = async (title: string, lyrics: string) => {
        setIsProcessing(true);
        setStatusMsg('Deploying New Signal Node...');
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, lyrics })
            });
            const newProject = await res.json();
            setProject(newProject);
            fetchProjects();
            fileInputRef.current?.click();
        } catch (error) { alert('Project creation failed'); } finally { setIsProcessing(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!project || !e.target.files?.[0]) return;
        setIsProcessing(true);
        setStatusMsg('Locking Audio Sample...');
        try {
            const formData = new FormData();
            formData.append('audio', e.target.files[0]);
            const res = await fetch(`/api/projects/${project.id}/upload-audio`, {
                method: 'POST',
                body: formData
            });
            const updated = await res.json();
            setProject(updated);
            // Auto-align
            const alRes = await fetch(`/api/projects/${updated.id}/align`, { method: 'POST' });
            setActiveJob(await alRes.json());
            setView('preview');
        } catch (error) { setIsProcessing(false); }
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white selection:bg-purple-500/30 font-sans tracking-tight">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    currentProject={project || undefined}
                    onProjectCreate={handleCreateProject} 
                    onProjectUpdate={(p) => { setProject(p); fetchProjects(); }}
                    onTemplateSelect={async (t) => {
                        setActiveTemplate(t);
                        if (project) {
                            try {
                                const res = await fetch(`/api/projects/${project.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ selectedTemplateId: t.id })
                                });
                                const updated = await res.json();
                                setProject(updated);
                                fetchProjects();
                            } catch (e) {}
                        }
                    }}
                    activeTemplateId={activeTemplate?.id}
                    currentTemplate={activeTemplate || undefined}
                />
                
                <section className="flex-1 flex flex-col bg-[#050505] relative">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="audio/*" />

                    {/* V7 Studio Header */}
                    <div className="h-20 border-b border-white/5 bg-zinc-950/40 backdrop-blur-3xl flex items-center justify-between px-10 shrink-0 z-20">
                        <div className="flex gap-10">
                            {[
                                { id: 'hub', icon: LayoutGrid, label: 'Workspace Hub' },
                                { id: 'preview', icon: PlayCircle, label: 'Visual Monitor' },
                                { id: 'editor', icon: SlidersHorizontal, label: 'Scene Production' },
                                { id: 'settings', icon: Settings, label: 'Studio Settings' }
                            ].map(nav => (
                                <button 
                                    key={nav.id}
                                    onClick={() => setView(nav.id as any)}
                                    className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 h-20 group ${view === nav.id ? 'text-white border-white' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                                >
                                    <nav.icon size={14} className={view === nav.id ? 'text-purple-500' : 'group-hover:text-zinc-400'} /> {nav.label}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-6">
                            {health?.status === 'degraded' && <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Activity size={16}/></div>}
                            <button 
                                onClick={() => setView('hub')}
                                className="px-6 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3"
                            >
                                <Plus size={14}/> New Signal
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col p-10 gap-10">
                        
                        {view === 'hub' && (
                            <div className="flex-1 overflow-y-auto animate-in fade-in zoom-in-95 duration-500 custom-scrollbar pr-4">
                                <div className="flex flex-col gap-12">
                                    <div className="flex flex-col gap-3">
                                        <h2 className="text-3xl font-black tracking-tighter">Production Archive</h2>
                                        <p className="text-[12px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{projects.length} Active Workspace Nodes</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {projects.map(p => (
                                            <div 
                                                key={p.id} 
                                                onClick={() => loadProject(p.id)}
                                                className="group p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden flex flex-col gap-6"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center border border-white/5 text-purple-500 group-hover:scale-110 transition-all">
                                                        <FolderOpen size={20}/>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 bg-black/40 px-3 py-1 rounded-full">{p.status}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-xl font-bold tracking-tight text-white">{p.title}</h3>
                                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-700 pt-4 border-t border-white/5">
                                                    <span>AspectRatio {p.aspectRatio}</span>
                                                    <span>•</span>
                                                    <span>Score {p.lastVisualScore}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === 'preview' && (
                            <div className="flex-1 flex flex-col gap-8 animate-in fade-in duration-500">
                                {project && timeline && activeTemplate ? (
                                    <div className="flex-1 rounded-[3rem] overflow-hidden border border-white/5 bg-black shadow-2xl relative">
                                         <RemotionPlayerWrapper 
                                            audioSrc={`/api/projects/${project.id}/audio`}
                                            timeline={timeline}
                                            template={activeTemplate}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-10 border-2 border-dashed border-zinc-900 rounded-[3rem]">
                                        <Box size={80} className="text-zinc-900" />
                                        <div className="text-center flex flex-col gap-4">
                                            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-700">Awaiting Signal Ingestion</p>
                                            <button onClick={() => setView('hub')} className="text-[9px] font-black text-purple-500 uppercase tracking-widest hover:underline">Return to Hub</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {view === 'settings' && (
                             <div className="flex-1 overflow-y-auto animate-in slide-in-from-right duration-500 max-w-4xl mx-auto w-full">
                                 <div className="flex flex-col gap-16 py-10">
                                     <section className="flex flex-col gap-8">
                                         <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Environment Diagnostics</label>
                                         <div className="grid grid-cols-2 gap-4">
                                             {health && Object.entries(health.checks).map(([key, val]: any) => (
                                                 <div key={key} className="p-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-between">
                                                     <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{key}</span>
                                                     {val ? <CheckCircle2 size={18} className="text-emerald-500"/> : <AlertCircle size={18} className="text-rose-500"/>}
                                                 </div>
                                             ))}
                                         </div>
                                     </section>

                                     <section className="flex flex-col gap-8">
                                         <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Intelligence Configuration</label>
                                         <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-white/5 space-y-8">
                                             <div className="flex flex-col gap-3">
                                                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Provider</span>
                                                 <div className="flex gap-4">
                                                     <button className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-2xl">OpenAI Cloud</button>
                                                     <button className="px-8 py-3 bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl">Local Neural</button>
                                                 </div>
                                             </div>
                                             <div className="flex flex-col gap-3">
                                                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Model</span>
                                                 <input className="bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-sm text-zinc-300 w-full font-medium" value={health?.details?.openaiModel} readOnly />
                                             </div>
                                         </div>
                                     </section>
                                 </div>
                             </div>
                        )}
                    </div>

                    <footer className="h-20 px-12 border-t border-white/5 bg-zinc-950 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] text-zinc-700">
                        <div className="flex gap-12">
                            <span className="flex items-center gap-3">Studio Source • <span className="text-zinc-500">{project?.title || 'Standalone Mode'}</span></span>
                            {activeTemplate && (
                                <span className="flex items-center gap-3 text-purple-600/80">
                                    <ShieldCheck size={14}/> {activeTemplate.name} 
                                    <span className="text-[9px] bg-zinc-900 text-zinc-800 px-2 py-0.5 rounded ml-2">V{activeTemplate.metadata?.version || 1}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex gap-8 items-center opacity-30">
                            <span>Diagnostic Status: {health?.status || 'Scanning...'}</span>
                            <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'}`}/>
                        </div>
                    </footer>
                </section>
            </div>
        </div>
    );
}
