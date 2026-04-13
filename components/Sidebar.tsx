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
    onProjectCreate: (title: string, lyrics: string) => void;
    onTemplateSelect: (template: Template) => void;
    activeTemplateId?: string;
    currentTemplate?: Template;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    onProjectCreate, 
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
    const [variants, setVariants] = useState<TemplateVariation[]>([]);
    const [assets, setAssets] = useState<BackgroundAsset[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [aiStatus, setAiStatus] = useState<'idle' | 'interpreting' | 'fallback'>('idle');

    useEffect(() => {
        if (tab === 'assets') fetchAssets();
        if (tab === 'library') fetchTemplates();
    }, [tab]);

    const fetchAssets = async () => {
        try {
            const res = await fetch('/api/assets');
            setAssets(await res.json());
        } catch (e) {}
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates');
            setTemplates(await res.json());
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
            setVariants(data);
            setAiStatus(res.headers.get('X-TemplateAI-Fallback') ? 'fallback' : 'idle');
        } catch (error) { setAiStatus('fallback'); } finally { setIsGenerating(false); }
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

    return (
        <aside className="w-[440px] border-r border-white/5 bg-zinc-950 flex flex-col h-full shrink-0 relative overflow-hidden">
            {/* V7 Tabbed Studio Navigation */}
            <div className="h-16 border-b border-white/5 bg-black/40 px-6 flex items-center justify-between overflow-x-auto custom-scrollbar scrollbar-hide shrink-0">
                <div className="flex gap-2">
                    {['monitor', 'director', 'assets', 'library', 'review', 'publish'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all px-3 py-2 rounded-lg border ${tab === t ? 'bg-zinc-800 border-white/10 text-white shadow-lg' : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'}`}
                        >
                            {t}
                        </button>
                    ))}
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
                        <button 
                            onClick={() => onProjectCreate(title, lyrics)}
                            className="w-full py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl shadow-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all"
                        >
                            Deploy Engine Node
                        </button>
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
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-6 block">Visual Intent Prompt</label>
                            <textarea 
                                className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none mb-6 font-medium leading-relaxed"
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
                        </section>

                        {currentTemplate && (
                            <section className="p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 shadow-2xl">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6 block">Studio Fine-Tune</label>
                                <div className="relative group">
                                    <input 
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-medium group-hover:border-white/10 transition-all font-bold"
                                        placeholder="e.g., Use luxury cinematic font..."
                                        value={refinePrompt}
                                        onChange={e => setRefinePrompt(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleAIRefine}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-all"
                                    >
                                        {isRefining ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                                    </button>
                                </div>
                            </section>
                        )}
                        
                        {variants.length > 0 && (
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Art Projections</label>
                                {variants.map((v, i) => (
                                    <div key={i} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col gap-4 group hover:border-purple-500/30 transition-all">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-zinc-400 flex items-center gap-2"><Layers size={14}/> {v.type}</span>
                                            <span className={v.score > 80 ? 'text-emerald-500 font-bold' : 'text-yellow-500 font-bold'}>{v.score}% Score</span>
                                        </div>
                                        <button 
                                            onClick={() => onTemplateSelect(v.template)}
                                            className="w-full py-4 bg-white text-black text-[9px] font-black uppercase tracking-[0.4em] rounded-xl hover:bg-zinc-200 transition-all shadow-xl shadow-black/20"
                                        >
                                            Lock Strategy
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'assets' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                        <section className="p-8 rounded-[2rem] bg-zinc-900 border border-white/5 border-dashed flex flex-col items-center justify-center gap-4 text-center">
                            <ImageIcon size={32} className="text-zinc-800" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Drop Visual Assets Here</p>
                        </section>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {assets.map(a => (
                                <div key={a.id} className="group aspect-video rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden relative cursor-pointer">
                                    <img src={a.publicPath} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white truncate">{a.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'library' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            {templates.map(t => (
                                <div key={t.id} className="p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-zinc-300">{t.name}</span>
                                        <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">{t.fontFamily} • {t.metadata?.sourceType}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 border border-white/5 rounded-lg text-zinc-700 hover:text-white transition-all"><Heart size={12}/></button>
                                        <button onClick={() => onTemplateSelect(t)} className="p-2 bg-white text-black rounded-lg"><Check size={12}/></button>
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
                                <ListChecks size={14}/> Quality Gates
                            </label>
                            <div className="space-y-3">
                                {[
                                    { label: 'Minimum Scene Score (60%)', ok: (currentTemplate?.metadata?.qualityScore || 0) >= 60 },
                                    { label: 'Safe-Zone Alignment', ok: true },
                                    { label: 'Timeline Consistency', ok: true },
                                ].map(l => (
                                    <div key={l.label} className="p-4 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{l.label}</span>
                                        {l.ok ? <CheckCircle size={16} className="text-emerald-500"/> : <Zap size={16} className="text-yellow-500"/>}
                                    </div>
                                ))}
                            </div>
                         </section>
                         <button className="w-full py-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl hover:bg-emerald-500/20 transition-all shadow-xl shadow-emerald-500/5">
                            Approve Strategy
                         </button>
                    </div>
                )}

                {tab === 'publish' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                        <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Studio Exports</label>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { ver: 'V2 Master Alpha', date: '2026-04-13', status: 'ready' },
                                    { ver: 'V1 Draft Stage', date: '2026-04-12', status: 'ready' }
                                ].map(r => (
                                    <div key={r.ver} className="p-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-zinc-300">{r.ver}</span>
                                            <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">{r.date}</span>
                                        </div>
                                        <button className="p-3 bg-zinc-950 text-zinc-500 group-hover:text-emerald-500 transition-all"><Download size={18}/></button>
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
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{currentTemplate?.name || 'Awaiting Signal Ingestion...'}</p>
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
