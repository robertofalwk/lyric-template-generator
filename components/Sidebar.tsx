'use client';

import React, { useState, useEffect } from 'react';
import { 
    Settings, Wand2, Music4, Palette, Sparkles, Send, 
    Loader2, Check, BookOpen, Star, Copy, Trash2, History as HistoryIcon,
    Shield, Scale, Zap, Info, ArrowLeft, RotateCcw, Activity, Layers, 
    Image as ImageIcon, Film, Briefcase, Plus, CheckCircle
} from 'lucide-react';
import { Template, TemplateVariation, BackgroundAsset, StylePack } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';

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
    const [tab, setTab] = useState<'workspace' | 'director' | 'assets' | 'library'>('workspace');
    
    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [variants, setVariants] = useState<TemplateVariation[]>([]);
    
    // Assets State
    const [backgrounds, setBackgrounds] = useState<BackgroundAsset[]>([]);
    const [packs, setPacks] = useState<StylePack[]>([]);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);
    
    // Library State
    const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
    const [templateHistory, setTemplateHistory] = useState<any[]>([]);

    const fetchAssets = async () => {
        setIsLoadingAssets(true);
        try {
            const [bRes, pRes] = await Promise.all([
                fetch('/api/backgrounds'),
                fetch('/api/packs')
            ]);
            const b = await bRes.json();
            const p = await pRes.json();
            setBackgrounds(b);
            setPacks(p);
        } catch (e) { console.error(e); } finally { setIsLoadingAssets(false); }
    };

    const fetchLibrary = async () => {
        try {
            const res = await fetch('/api/templates');
            const data = await res.json();
            setSavedTemplates(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (tab === 'assets') fetchAssets();
        if (tab === 'library') fetchLibrary();
    }, [tab]);

    const handleAIGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/templates/generate-variants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await res.json();
            setVariants(data);
            setTab('director');
        } catch (error) { alert('AI Generation failed'); } finally { setIsGenerating(false); }
    };

    const handleApplyAsset = (asset: BackgroundAsset) => {
        if (!currentTemplate) return;
        const updated: Template = {
            ...currentTemplate,
            backgroundMode: asset.type === 'video' ? 'video' : 'image',
            backgroundAssetId: asset.id,
            backgroundAssetType: asset.type === 'video' ? 'video' : 'image',
        };
        onTemplateSelect(updated);
    };

    const handleAutoFix = async () => {
        if (!currentTemplate) return;
        try {
            const res = await fetch('/api/templates/autofix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentTemplate, mode: 'soft' })
            });
            const fixed = await res.json();
            onTemplateSelect(fixed);
        } catch (e) { alert('Auto-fix failed'); }
    };

    return (
        <aside className="w-[440px] border-r border-white/5 bg-zinc-950 flex flex-col h-full shrink-0 relative overflow-hidden">
            {/* V4 Vertical Tab Nav */}
            <div className="flex h-16 border-b border-white/5 bg-black/40 px-4 items-center justify-between">
                <div className="flex gap-4">
                    {['workspace', 'director', 'assets', 'library'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all px-3 py-2 rounded-lg ${tab === t ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"/>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar mt-8">
                {tab === 'workspace' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-left duration-500">
                        <section className="flex flex-col gap-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Active Workflow</label>
                            <input 
                                className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 font-medium"
                                placeholder="Summer Anthem 2026..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </section>
                        <section className="flex flex-col gap-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Source Narrative</label>
                            <textarea 
                                className="w-full h-80 bg-zinc-900 border border-white/5 rounded-2xl px-6 py-6 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none font-medium leading-relaxed"
                                placeholder="Project lyrics..."
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                            />
                        </section>
                        <button 
                            onClick={() => onProjectCreate(title, lyrics)}
                            className="w-full py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-zinc-200 transition-all"
                        >
                            Deploy Workspace
                        </button>
                    </div>
                )}

                {tab === 'director' && (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                        <section className="p-8 rounded-[2rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles size={18} className="text-purple-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Generative Mastery</span>
                            </div>
                            <textarea 
                                className="w-full h-28 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none mb-6 font-medium"
                                placeholder="Direct the AI style..."
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                            />
                            <button 
                                onClick={handleAIGenerate}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20"
                            >
                                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : 'Interpret Direction'}
                            </button>
                        </section>

                        {variants.length > 0 && (
                            <div className="grid grid-cols-1 gap-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-2">Proposed Variations</label>
                                {variants.map((v, i) => (
                                    <div key={i} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex flex-col gap-5 group hover:border-purple-500/30 transition-all">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                            <span className="flex items-center gap-2 text-zinc-300"><Layers size={12}/> {v.type}</span>
                                            <span className={`${v.score > 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>{v.score}%</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 italic">"{v.explanation}"</p>
                                        <button 
                                            onClick={() => onTemplateSelect(v.template)}
                                            className="w-full py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200"
                                        >
                                            Apply Concept
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'assets' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right duration-500">
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Motion & Depth Assets</label>
                                <button className="p-2 bg-zinc-900 rounded-lg text-zinc-600 hover:text-white transition-all"><Plus size={14}/></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {backgrounds.map(b => (
                                    <div 
                                        key={b.id} 
                                        onClick={() => handleApplyAsset(b)}
                                        className={`group cursor-pointer aspect-[9/16] rounded-2xl border transition-all relative overflow-hidden ${currentTemplate?.backgroundAssetId === b.id ? 'border-purple-500 ring-1 ring-purple-500/50 shadow-xl shadow-purple-500/10' : 'border-white/5 hover:border-white/20'}`}
                                    >
                                        {b.type === 'video' ? <Film size={20} className="absolute bottom-3 right-3 text-white/50" /> : <ImageIcon size={20} className="absolute bottom-3 right-3 text-white/50" />}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                                            <span className="text-[8px] font-black uppercase text-white truncate">{b.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="flex flex-col gap-6 border-t border-white/5 pt-10">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Curated Style Packs</label>
                            {packs.map(p => (
                                <div key={p.id} className="p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex justify-between items-center group">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[12px] font-bold text-zinc-300 group-hover:text-white">{p.name}</span>
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{p.category} • {p.config.templateIds.length} styles</span>
                                    </div>
                                    <button className="px-5 py-2 bg-black/40 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-purple-500 hover:text-white transition-all">Activate</button>
                                </div>
                            ))}
                        </section>
                    </div>
                )}

                {tab === 'library' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-300">
                        <section className="flex flex-col gap-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Personal Vault</label>
                             <div className="space-y-4">
                                 {savedTemplates.map(t => (
                                     <div key={t.id} className={`group w-full p-5 rounded-3xl border transition-all flex justify-between items-center ${activeTemplateId === t.id ? 'bg-purple-500/5 border-purple-500/20' : 'bg-zinc-900 border-white/5 hover:border-zinc-800'}`}>
                                         <div onClick={() => onTemplateSelect(t)} className="flex-1 cursor-pointer">
                                             <span className="text-[12px] font-bold block mb-1">{t.name}</span>
                                             <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">V{t.metadata?.version || 1} • {t.metadata?.sourceType}</span>
                                         </div>
                                         <div className="flex gap-2">
                                            <button className="p-2 text-zinc-700 hover:text-white transition-all"><Copy size={14}/></button>
                                            <button className="p-2 text-zinc-700 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </section>
                    </div>
                )}
            </div>

            {/* V4 Telemetry Footer */}
            <div className="p-10 border-t border-white/5 bg-zinc-950 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/5 flex items-center justify-center">
                            <Activity size={20} className="text-purple-500" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[11px] font-black text-zinc-100 tracking-[0.1em] uppercase">Visual Health</p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{currentTemplate?.name || 'Awaiting Architecture...'}</p>
                        </div>
                    </div>
                    {currentTemplate?.metadata?.qualityScore && (
                        <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-4">
                                {currentTemplate.metadata.qualityScore < 70 && (
                                    <button 
                                        onClick={handleAutoFix}
                                        className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-[8px] font-black uppercase tracking-widest hover:bg-yellow-500/20 transition-all"
                                    >
                                        <Wand2 size={10}/> Auto-Fix
                                    </button>
                                )}
                                <span className={`text-[11px] font-black ${currentTemplate.metadata.qualityScore > 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>{currentTemplate.metadata.qualityScore}%</span>
                            </div>
                            <div className="w-24 h-2 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/5">
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
