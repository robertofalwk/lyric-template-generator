'use client';

import React, { useState, useEffect } from 'react';
import { 
    Wand2, Palette, Sparkles, Send, 
    Loader2, Check, Activity, Layers, 
    Image as ImageIcon, CheckCircle, 
    ChevronRight, ListChecks, Download,
    Cpu, RefreshCw, Zap, Plus, History as HistoryIcon,
    Trash2, Heart, Copy, Film
} from 'lucide-react';
import { Project, ProjectScene, ProjectComment, Template, TemplateVariation, BackgroundAsset } from '@/src/schemas';

interface SidebarProps {
    currentProject?: Project;
    onProjectCreate: (title: string, lyrics: string) => void;
    onProjectUpdate: (project: Project) => void;
    onTemplateSelect: (template: Template) => void;
    activeTemplateId?: string;
    currentTemplate?: Template;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    currentProject,
    onProjectCreate, 
    onProjectUpdate,
    onTemplateSelect, 
    activeTemplateId,
    currentTemplate 
}) => {
    const [title, setTitle] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [tab, setTab] = useState<'monitor' | 'director' | 'assets' | 'library' | 'review' | 'publish'>('monitor');
    
    // AI & Assets State
    const [aiPrompt, setAiPrompt] = useState('');
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [assets, setAssets] = useState<BackgroundAsset[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [comments, setComments] = useState<ProjectComment[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [aiStatus, setAiStatus] = useState<'idle' | 'interpreting' | 'fallback'>('idle');

    useEffect(() => {
        if (currentProject) {
            setTitle(currentProject.title);
            setLyrics(currentProject.lyricsRaw || '');
        }
    }, [currentProject?.id]);

    useEffect(() => {
        if (tab === 'assets') fetchAssets();
        if (tab === 'library') fetchTemplates();
        if (tab === 'review' && currentProject) fetchComments();
        if (tab === 'publish' && currentProject) fetchJobs();

        let poll: NodeJS.Timeout | null = null;
        if (tab === 'publish' && currentProject) {
            poll = setInterval(fetchJobs, 3000);
        }

        return () => { if (poll) clearInterval(poll); };
    }, [tab, currentProject?.id]);

    const fetchAssets = async () => {
        try {
            const res = await fetch('/api/backgrounds');
            const data = await res.json();
            setAssets(Array.isArray(data) ? data : []);
        } catch (e) {
            setAssets([]);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates');
            const data = await res.json();
            setTemplates(Array.isArray(data) ? data : []);
        } catch (e) {}
    };

    const fetchComments = async () => {
        if (!currentProject) return;
        try {
            const res = await fetch(`/api/projects/${currentProject.id}/comments`);
            setComments(await res.json());
        } catch (e) {}
    };

    const fetchJobs = async () => {
        if (!currentProject) return;
        try {
            const res = await fetch(`/api/projects/${currentProject.id}/jobs`);
            setJobs(await res.json());
        } catch (e) {}
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        setAiStatus('interpreting');
        try {
            const res = await fetch('/api/templates/generate-variants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt })
            });

            const data = await res.json();

            if (!res.ok) {
                setAiStatus('fallback');
                alert(`AI Signal Interruption: ${data.error || 'Unknown Error'}`);
                return;
            }

            setAiStatus(res.headers.get('X-TemplateAI-Fallback') ? 'fallback' : 'idle');
            (window as any).__LAST_VARIANTS__ = data;
        } catch (error: any) { 
            setAiStatus('fallback');
            alert(`Network Signal Failure: ${error.message}`);
        } finally { 
            setIsGenerating(false); 
        }
    };

    const handleAIRefine = async () => {
        if (!refinePrompt || !currentTemplate) return;
        setIsRefining(true);
        setAiStatus('interpreting');
        try {
            const res = await fetch('/api/templates/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentTemplate, prompt: refinePrompt })
            });
            const refined = await res.json();
            onTemplateSelect(refined);
            setRefinePrompt('');
            setAiStatus(res.headers.get('X-TemplateAI-Fallback') ? 'fallback' : 'idle');
        } catch (error) { setAiStatus('fallback'); } finally { setIsRefining(false); }
    };

    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await fetch('/api/backgrounds/upload', { method: 'POST', body: formData });
            fetchAssets();
        } catch (e) {
            console.error('Upload failed', e);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAssetDelete = async (id: string) => {
        if (!confirm('Delete this asset?')) return;
        try {
            await fetch(`/api/backgrounds/${id}`, { method: 'DELETE' });
            fetchAssets();
        } catch (e) {}
    };

    const handleAssetSelect = async (asset: BackgroundAsset) => {
        if (!currentProject) return;
        try {
            const res = await fetch(`/api/projects/${currentProject.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedBackgroundAssetId: asset.id })
            });
            onProjectUpdate(await res.json());
        } catch (e) {}
    };

    const handleTemplateFavorite = async (id: string, current: boolean) => {
        try {
            await fetch(`/api/templates/${id}/favorite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFavorite: !current })
            });
            fetchTemplates();
        } catch (e) {}
    };

    const handleTemplateDuplicate = async (id: string) => {
        try {
            await fetch(`/api/templates/${id}/duplicate`, { method: 'POST' });
            fetchTemplates();
        } catch (e) {}
    };

    const handleTemplateDelete = async (id: string) => {
        if (!confirm('Delete this template?')) return;
        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            if (!res.ok) return;
            fetchTemplates();
        } catch (e) {}
    };

    const handleApproveProject = async () => {
        if (!currentProject) return;
        try {
            const res = await fetch(`/api/projects/${currentProject.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            onProjectUpdate(await res.json());
        } catch (e) {}
    };

    const handleProjectUpdateCommand = async () => {
        if (!currentProject) return;
        try {
            const res = await fetch(`/api/projects/${currentProject.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, lyricsRaw: lyrics })
            });
            onProjectUpdate(await res.json());
        } catch (e) {}
    };
    
    const handleStartRender = async () => {
        if (!currentProject || !currentTemplate) return;
        setIsGenerating(true); // Reusing loader state
        try {
            const res = await fetch(`/api/projects/${currentProject.id}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    presetId: 'v7_premium_master',
                    formats: ['mp4_h264'],
                    customTemplate: currentTemplate 
                })
            });
            if (!res.ok) {
                const err = await res.json();
                const issuesStr = err.issues ? '\nBlocking Issues:\n' + err.issues.map((i: any) => `* ${i.message}`).join('\n') : '';
                throw new Error(`${err.error || 'Render failure'}${issuesStr}`);
            }
            fetchJobs();
            setTab('publish');
        } catch (e: any) {
            alert(`Render Request Blocked: ${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <aside className="w-[440px] border-r border-white/5 bg-zinc-950 flex flex-col h-full shrink-0 relative overflow-hidden">
            {/* V7 Tabbed Studio Navigation */}
            <div className="h-16 border-b border-white/5 bg-black/40 px-6 flex items-center justify-between overflow-x-auto custom-scrollbar scrollbar-hide shrink-0">
                <div className="flex gap-2">
                    {['monitor', 'director', 'review', 'publish'].map(t => {
                        const hasProject = !!currentProject;
                        const hasAudio = !!currentProject?.audioOriginalPath;
                        const hasTimeline = !!currentProject?.timeline;
                        
                        let isLocked = false;
                        if (!hasProject && t !== 'monitor') isLocked = true;
                        if (hasProject) {
                            // Director is now unlocked early for strategy planning
                            if (t === 'review' && !hasTimeline) isLocked = true;
                            if (t === 'publish' && currentProject?.status !== 'approved') isLocked = true;
                        }

                        return (
                            <button 
                                key={t}
                                disabled={isLocked}
                                onClick={() => setTab(t as any)}
                                className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all px-3 py-2 rounded-lg border ${
                                    isLocked ? 'opacity-20 cursor-not-allowed border-transparent text-zinc-800' :
                                    tab === t ? 'bg-zinc-800 border-white/10 text-white shadow-lg' : 
                                    'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'
                                }`}
                                title={isLocked ? 'Signal requirements not met' : ''}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar shrink-0 mt-10">
                {tab === 'monitor' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-left duration-500">
                        <section className="flex flex-col gap-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Studio Signal Node</label>
                            <input 
                                className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 font-bold"
                                placeholder="Production Title..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </section>
                        <section className="flex flex-col gap-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Narrative Sample</label>
                            <textarea 
                                className="w-full h-80 bg-zinc-900 border border-white/5 rounded-2xl px-6 py-6 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none font-medium leading-relaxed"
                                placeholder="Paste lyrics source..."
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                            />
                        </section>
                        {currentProject ? (
                            <button 
                                onClick={handleProjectUpdateCommand}
                                className="w-full py-5 bg-purple-600 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl shadow-2xl hover:bg-purple-500 active:scale-[0.98] transition-all"
                            >
                                Update Project State
                            </button>
                        ) : (
                            <button 
                                onClick={() => onProjectCreate(title, lyrics)}
                                className="w-full py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl shadow-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all"
                            >
                                Deploy Engine Node
                            </button>
                        )}
                    </div>
                )}

                {tab === 'director' && (
                    <div className="flex flex-col gap-10 animate-in slide-in-from-right duration-500">
                        <section className="p-10 rounded-[2.5rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 shadow-2xl relative overflow-hidden">
                            {aiStatus === 'fallback' && (
                                <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-[8px] font-black uppercase tracking-widest">
                                    <Cpu size={10}/> Local Fallback
                                </div>
                            )}
                            
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-6 block">Visual Strategy</label>
                                <textarea 
                                    className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none font-medium leading-relaxed"
                                    placeholder="Direct the visual mood..."
                                    value={aiPrompt}
                                    onChange={e => setAiPrompt(e.target.value)}
                                />
                                <button 
                                    onClick={handleAIGenerate}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-3"
                                >
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14}/> Interpret Strategy</>}
                                </button>
                            </div>

                            {currentTemplate && (
                                <div className="mt-8 space-y-4 p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                                    <div className="flex items-center gap-2 text-purple-400 font-bold text-[10px] uppercase tracking-wider">
                                        <Sparkles size={14}/> Visual DNA Mastered
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                                        <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                            <div className="text-zinc-500 mb-1">Text Mode</div>
                                            <div className="text-white font-mono uppercase">{currentTemplate.textBehavior?.mode || 'Word by Word'}</div>
                                        </div>
                                        <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                            <div className="text-zinc-500 mb-1">Camera DNS</div>
                                            <div className="text-white font-mono uppercase">{currentTemplate.cameraMotion?.preset || 'None'}</div>
                                        </div>
                                        <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                            <div className="text-zinc-500 mb-1">Visual FX</div>
                                            <div className="text-white font-mono uppercase">
                                                {currentTemplate.visualFx?.chromaticAberration ? 'Chromatic ' : ''}
                                                {currentTemplate.visualFx?.grain ? 'Grain ' : ''}
                                                {currentTemplate.visualFx?.vignette ? 'Vignette' : 'Standard'}
                                            </div>
                                        </div>
                                        <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                            <div className="text-zinc-500 mb-1">Highlight</div>
                                            <div className="text-white font-mono uppercase">{currentTemplate.highlightMode}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 space-y-2">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Refine Visual Evolution</label>
                                <div className="relative">
                                    <textarea 
                                        value={refinePrompt}
                                        onChange={(e) => setRefinePrompt(e.target.value)}
                                        placeholder="Add glow, change to rolling lines, make it more kinetic..."
                                        className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-purple-500 h-24 resize-none transition-all pr-12"
                                    />
                                    <button 
                                        onClick={() => refinePrompt && handleAIRefine()}
                                        disabled={isRefining || !refinePrompt}
                                        className="absolute bottom-4 right-4 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                                    >
                                        {isRefining ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Scene Manifest Hub */}
                        {currentProject?.scenes && currentProject.scenes.length > 0 && (
                            <section className="flex flex-col gap-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                                    <Film size={14}/> Studio Scene Manifest
                                </label>
                                <div className="space-y-4">
                                    {currentProject.scenes.map((scene, idx) => (
                                        <div key={scene.id} className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 group hover:border-purple-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="text-[10px] font-bold text-zinc-300">Scene {idx + 1}: {scene.sectionType}</div>
                                                    <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">
                                                        {(scene.startMs / 1000).toFixed(1)}s - {(scene.endMs / 1000).toFixed(1)}s
                                                    </div>
                                                </div>
                                                <div className="px-2 py-0.5 bg-zinc-800 rounded-md text-[7px] font-black uppercase tracking-widest text-zinc-500">
                                                    {scene.templateId ? scene.templateId.slice(0, 15) : 'Auto'}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500/50" style={{ width: scene.intensity === 'high' ? '100%' : scene.intensity === 'medium' ? '60%' : '30%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {tab === 'assets' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                        <label className="p-8 rounded-[2rem] bg-zinc-900 border border-white/5 border-dashed flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:bg-zinc-800 transition-all">
                            <input type="file" className="hidden" onChange={handleAssetUpload} accept="image/*,video/*" />
                            {isUploading ? <Loader2 size={32} className="animate-spin text-purple-500" /> : <ImageIcon size={32} className="text-zinc-800" />}
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                {isUploading ? 'Uploading Art...' : 'Drop Visual Assets Here'}
                            </p>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {assets.map(a => (
                                <div 
                                    key={a.id} 
                                    onClick={() => handleAssetSelect(a)}
                                    className={`group aspect-video rounded-2xl bg-zinc-900 border overflow-hidden relative cursor-pointer transition-all ${currentProject?.selectedBackgroundAssetId === a.id ? 'border-purple-500 shadow-xl shadow-purple-500/20' : 'border-white/5 hover:border-white/20'}`}
                                >
                                    <img src={a.publicPath} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 justify-between">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white truncate">{a.name}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleAssetDelete(a.id); }}
                                            className="p-1 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={12}/>
                                        </button>
                                    </div>
                                    {currentProject?.selectedBackgroundAssetId === a.id && (
                                        <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1 shadow-lg">
                                            <Check size={8}/>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'library' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            {templates.map(t => (
                                <div key={t.id} className={`p-5 rounded-2xl bg-zinc-900 border transition-all flex items-center justify-between group ${activeTemplateId === t.id ? 'border-purple-500 shadow-xl shadow-purple-500/20' : 'border-white/5 hover:border-white/20'}`}>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-zinc-300">{t.name}</span>
                                        <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">{t.fontFamily} • {t.metadata?.sourceType} • v{t.metadata?.version || 1}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleTemplateFavorite(t.id, t.metadata?.isFavorite || false)}
                                            className={`p-2 border border-white/5 rounded-lg transition-all ${t.metadata?.isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-zinc-700 hover:text-white'}`}
                                        >
                                            <Heart size={12} fill={t.metadata?.isFavorite ? 'currentColor' : 'none'}/>
                                        </button>
                                        <button 
                                            onClick={() => handleTemplateDuplicate(t.id)}
                                            className="p-2 border border-white/5 rounded-lg text-zinc-700 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Copy size={12}/>
                                        </button>
                                        <button 
                                            onClick={() => handleTemplateDelete(t.id)}
                                            disabled={t.metadata?.sourceType === 'stock'}
                                            className={`p-2 border border-white/5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                                                t.metadata?.sourceType === 'stock'
                                                    ? 'text-zinc-800 cursor-not-allowed'
                                                    : 'text-zinc-700 hover:text-red-500'
                                            }`}
                                        >
                                            <Trash2 size={12}/>
                                        </button>
                                        <button onClick={() => onTemplateSelect(t)} className={`p-2 rounded-lg transition-all ${activeTemplateId === t.id ? 'bg-purple-500 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}>
                                            {activeTemplateId === t.id ? <Check size={12}/> : <Send size={12}/>}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'review' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                         <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 flex items-center gap-2">
                                <ListChecks size={14}/> Studio Quality Gates
                            </label>
                            <div className="space-y-3">
                                {[
                                    { label: 'Technical Health Score (>70%)', ok: (currentTemplate?.metadata?.qualityScore || 0) >= 70 },
                                    { label: 'Lineage Integrity', ok: !!currentTemplate?.metadata?.providerUsed },
                                    { label: 'Project Persistence', ok: !!currentProject?.id },
                                    { label: 'Visual Contract Verification', ok: !!currentTemplate?.fontFamily },
                                ].map(l => (
                                    <div key={l.label} className="p-4 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{l.label}</span>
                                        {l.ok ? <CheckCircle size={16} className="text-emerald-500"/> : <Zap size={16} className="text-yellow-500"/>}
                                    </div>
                                ))}
                            </div>
                         </section>

                         <section className="flex flex-col gap-6">
                             <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Studio Feedback</label>
                             <div className="space-y-4">
                                 {comments.length === 0 && <p className="text-[9px] text-zinc-800 uppercase tracking-widest font-black text-center py-4">No production notes yet</p>}
                                 {comments.map(c => (
                                     <div key={c.id} className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
                                         <p className="text-xs text-zinc-400 mb-2">{c.message}</p>
                                         <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-zinc-700">
                                            <span>{c.type} • {c.status}</span>
                                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </section>

                         <button 
                            disabled={currentProject?.status === 'approved'}
                            onClick={handleApproveProject}
                            className={`w-full py-5 font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl transition-all shadow-xl ${currentProject?.status === 'approved' ? 'bg-emerald-500 text-white cursor-default' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'}`}
                         >
                            {currentProject?.status === 'approved' ? 'Strategy Approved' : 'Approve Strategy'}
                         </button>
                    </div>
                )}

                {tab === 'publish' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                        <section className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 shadow-2xl">
                             <div className="flex items-center justify-between mb-8">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Master Render Console</label>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                    <Activity size={10} className="animate-pulse"/> Signal OK
                                </div>
                             </div>
                             <button 
                                onClick={handleStartRender}
                                disabled={isGenerating}
                                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                             >
                                {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <><Film size={16}/> Start Studio Render</>}
                             </button>
                             <p className="mt-4 text-[8px] text-zinc-600 font-bold uppercase tracking-widest text-center italic">Advanced V7 Kinematics & Post-Processing Engaged</p>
                        </section>

                        <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Live Studio Exports Archive</label>
                            <div className="grid grid-cols-1 gap-4">
                                {jobs.length === 0 && <p className="text-[9px] text-zinc-800 uppercase tracking-widest font-black text-center py-10">No renders detected</p>}
                                {jobs.map(j => (
                                    <div key={j.id} className="p-6 rounded-3xl bg-zinc-900 border border-white/5 flex flex-col gap-4 group hover:border-emerald-500/20 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-bold text-zinc-300 capitalize">{j.type} Render</span>
                                                <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">{new Date(j.createdAt).toLocaleTimeString()} • <span className={j.status === 'completed' ? 'text-emerald-500/80' : 'text-purple-400'}>{j.status}</span></span>
                                                {j.status === 'completed' && j.finishedAt && j.outputPath && (
                                                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                                                        [DONE {new Date(j.finishedAt).toLocaleTimeString()}] • file: {j.outputPath.split('/').pop()}
                                                    </span>
                                                )}
                                            </div>
                                            {j.status === 'completed' ? (
                                                <a href={j.outputPath} download className="p-3 bg-zinc-950 text-emerald-500 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-2 text-[10px] uppercase font-black tracking-widest">
                                                    <Download size={14}/> Download
                                                </a>
                                            ) : (
                                                <div className="p-3 text-zinc-700 animate-pulse"><Film size={18}/></div>
                                            )}
                                        </div>
                                        
                                        {(j.status === 'processing' || j.status === 'queued') && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-zinc-600">
                                                    <span>Signal Processing</span>
                                                    <span>{j.progress}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500 transition-all duration-500" 
                                                        style={{ width: `${j.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* V7 Studio Footer Telemetry */}
            <div className="p-10 border-t border-white/5 bg-zinc-950 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.5)] z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-all"/>
                             <Activity size={18} className="text-purple-500 relative z-10 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[11px] font-black text-zinc-200 tracking-[0.1em] uppercase">Lyric Lab V7</p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{currentProject?.title || 'Awaiting Signal Ingestion...'}</p>
                        </div>
                    </div>
                    {currentTemplate?.metadata?.qualityScore && (
                        <div className="flex flex-col items-end gap-2.5">
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${currentTemplate.metadata.qualityScore > 80 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                    {currentTemplate.metadata.qualityScore}% Health
                                </span>
                            </div>
                            <div className="w-24 h-2 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${currentTemplate.metadata.qualityScore > 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]'}`} 
                                    style={{ width: `${currentTemplate.metadata.qualityScore}%` }} 
                                />
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
