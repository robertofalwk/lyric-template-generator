'use client';

import React, { useState, useEffect } from 'react';
import { 
    Wand2, Music4, Palette, Sparkles, Send, 
    Loader2, Check, BookOpen, Copy, Trash2, History as HistoryIcon,
    Shield, Scale, Zap, RotateCcw, Activity, Layers, 
    Image as ImageIcon, Film, Plus, CheckCircle, Clock, Scissors,
    ChevronRight, ChevronDown, MonitorPlay
} from 'lucide-react';
import { Template, TemplateVariation, BackgroundAsset, StylePack, ProjectScene } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';

interface SidebarProps {
    onProjectCreate: (title: string, lyrics: string) => void;
    onTemplateSelect: (template: Template) => void;
    activeTemplateId?: string;
    currentTemplate?: Template;
    onSceneApplied?: (scene: ProjectScene) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    onProjectCreate, 
    onTemplateSelect, 
    activeTemplateId,
    currentTemplate,
    onSceneApplied 
}) => {
    const [title, setTitle] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [tab, setTab] = useState<'workspace' | 'director' | 'scenes' | 'library'>('workspace');
    
    // AI / States
    const [isGenerating, setIsGenerating] = useState(false);
    const [variants, setVariants] = useState<TemplateVariation[]>([]);
    
    // Scenes State
    const [scenes, setScenes] = useState<ProjectScene[]>([]);
    const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
    
    // Assets & Packs
    const [backgrounds, setBackgrounds] = useState<BackgroundAsset[]>([]);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);
    const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);

    const fetchScenes = async () => {
        // In a real app, this pulls from /api/projects/:id/scenes
    };

    const fetchAssets = async () => {
        setIsLoadingAssets(true);
        try {
            const res = await fetch('/api/backgrounds');
            const b = await res.json();
            setBackgrounds(b);
        } catch (e) { console.error(e); } finally { setIsLoadingAssets(false); }
    };

    useEffect(() => {
        if (tab === 'scenes') fetchScenes();
        if (tab === 'director') fetchAssets();
    }, [tab]);

    const handleAIGenerate = async (prompt: string) => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/templates/generate-variants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            setVariants(data);
        } catch (error) { alert('AI Generation failed'); } finally { setIsGenerating(false); }
    };

    return (
        <aside className="w-[480px] border-r border-white/5 bg-zinc-950 flex flex-col h-full shrink-0 relative overflow-hidden">
            {/* V5 Segmented Navigation */}
            <div className="flex h-20 border-b border-white/5 bg-black/50 px-8 items-center justify-between">
                 <div className="flex gap-2">
                    {['workspace', 'scenes', 'director', 'library'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`text-[9px] font-black uppercase tracking-[0.25em] transition-all px-4 py-2.5 rounded-xl border ${tab === t ? 'bg-zinc-800 border-white/10 text-white shadow-lg' : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"/>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar mt-10">
                {tab === 'workspace' && (
                    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-left duration-600">
                        <div className="flex flex-col gap-5">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Production Identity</label>
                            <input 
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-semibold"
                                placeholder="Untitled Studio Master..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-5">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Narrative Source</label>
                            <textarea 
                                className="w-full h-80 bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-6 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none font-medium leading-relaxed"
                                placeholder="Paste or compose lyrics..."
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => onProjectCreate(title, lyrics)}
                            className="w-full py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl hover:bg-zinc-100 transition-all active:scale-[0.98]"
                        >
                            Execute Master Pipeline
                        </button>
                    </div>
                )}

                {tab === 'scenes' && (
                    <div className="flex flex-col gap-8 animate-in slide-in-from-right duration-500">
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Visual Journey (Scenes)</label>
                                <button className="p-2.5 bg-zinc-900 rounded-xl text-zinc-600 hover:text-white transition-all"><Plus size={16}/></button>
                            </div>
                            
                            {scenes.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-zinc-900 rounded-[2.5rem] flex flex-col items-center gap-6 text-center opacity-40">
                                    <MonitorPlay size={32} className="text-zinc-700" />
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Scenes Detected</p>
                                        <button className="text-[9px] font-bold text-blue-500 hover:underline">RUN AUTO-SEGMENTATION</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {scenes.map((s, idx) => (
                                        <div 
                                            key={s.id} 
                                            onClick={() => setActiveSceneId(s.id)}
                                            className={`p-6 rounded-3xl border transition-all cursor-pointer group ${activeSceneId === s.id ? 'bg-blue-500/5 border-blue-500/30 shadow-xl shadow-blue-500/5' : 'bg-zinc-900 border-white/5 hover:border-zinc-800'}`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${s.sectionType === 'chorus' ? 'bg-orange-500 text-white' : 'bg-zinc-950 text-zinc-500'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-bold uppercase tracking-tight">{s.name}</span>
                                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{Math.floor(s.startMs/1000)}s — {Math.floor(s.endMs/1000)}s</span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className={`transition-all ${activeSceneId === s.id ? 'rotate-90 text-blue-500' : 'text-zinc-800 group-hover:text-zinc-600'}`} />
                                            </div>
                                            
                                            {activeSceneId === s.id && (
                                                <div className="pt-4 border-t border-white/5 mt-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                                                    <button className="flex items-center gap-2 px-4 py-3 bg-zinc-950 rounded-xl text-[9px] font-black uppercase text-zinc-400 hover:text-white border border-white/5"><Palette size={12}/> Style</button>
                                                    <button className="flex items-center gap-2 px-4 py-3 bg-zinc-950 rounded-xl text-[9px] font-black uppercase text-zinc-400 hover:text-white border border-white/5"><ImageIcon size={12}/> Asset</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {tab === 'director' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                         <section className="p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-8">
                                <Wand2 size={24} className="text-blue-400" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400">Direction Engine V5</span>
                            </div>
                            <textarea 
                                className="w-full h-32 bg-black/60 border border-white/5 rounded-3xl px-6 py-6 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none mb-8 font-medium leading-relaxed placeholder:text-zinc-800"
                                placeholder="Input visual intent or mood directives..."
                            />
                            <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98]">
                                Analyze & Generate
                            </button>
                         </section>

                         <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Studio Asset Vault</label>
                            <div className="grid grid-cols-2 gap-4">
                                {backgrounds.map(b => (
                                    <div key={b.id} className="group relative aspect-[9/16] rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden cursor-pointer hover:border-white/20 transition-all">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"/>
                                        <div className="absolute inset-0 flex flex-col justify-end p-5">
                                            <span className="text-[9px] font-black uppercase text-white truncate">{b.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </section>
                    </div>
                )}

                {tab === 'library' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-300">
                        <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Production Library</label>
                            <div className="space-y-4">
                                {TEMPLATES_REGISTRY.slice(0, 5).map(t => (
                                    <div key={t.id} className="p-5 bg-zinc-900/50 border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-zinc-900 transition-all">
                                        <span className="text-[12px] font-bold text-zinc-400 group-hover:text-white transition-all">{t.name}</span>
                                        <button className="p-2.5 rounded-xl bg-zinc-950 text-zinc-800 group-hover:text-white transition-all"><ChevronRight size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* V5 High-Fidelity Status */}
            <div className="p-10 border-t border-white/5 bg-zinc-950 shadow-[0_-40px_80px_-20px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all"/>
                             <Activity size={24} className="text-blue-500 relative z-10" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-[12px] font-black text-zinc-200 tracking-[0.1em] uppercase">V5 MASTER ARCHITECTURE</p>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{currentTemplate?.name || 'INITIALIZING STUDIO...'}</p>
                        </div>
                    </div>
                    {currentTemplate?.metadata?.qualityScore && (
                        <div className="flex flex-col items-end gap-3 px-6 py-4 bg-zinc-900/40 rounded-[2rem] border border-white/5">
                            <span className={`text-[11px] font-black uppercase tracking-widest ${currentTemplate.metadata.qualityScore > 80 ? 'text-blue-400' : 'text-yellow-500'}`}>
                                {currentTemplate.metadata.qualityScore}% Health
                            </span>
                            <div className="w-28 h-2 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${currentTemplate.metadata.qualityScore > 80 ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-yellow-500'}`} 
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
