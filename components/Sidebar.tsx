'use client';

import React, { useState, useEffect } from 'react';
import { 
    Settings, Wand2, Music4, Palette, Sparkles, Send, 
    Loader2, Check, BookOpen, Star, Copy, Trash2, History as HistoryIcon,
    Shield, Scale, Zap, Info, ArrowLeft, RotateCcw, Activity, Layers, ExternalLink
} from 'lucide-react';
import { Template, TemplateVariation } from '@/src/schemas';
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
    const [tab, setTab] = useState<'project' | 'design'>('project');
    const [designSubTab, setDesignSubTab] = useState<'generate' | 'library' | 'variants' | 'history'>('generate');
    
    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [variants, setVariants] = useState<TemplateVariation[]>([]);
    
    // Library State
    const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const [templateHistory, setTemplateHistory] = useState<any[]>([]);

    const fetchLibrary = async () => {
        setIsLoadingLibrary(true);
        try {
            const res = await fetch('/api/templates');
            const data = await res.json();
            setSavedTemplates(data);
        } catch (err) {
            console.error('Failed to load library');
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    const fetchHistory = async (id: string) => {
        try {
            const res = await fetch(`/api/templates/${id}/history`);
            const data = await res.json();
            setTemplateHistory(data);
            setDesignSubTab('history');
        } catch (err) {
            alert('Failed to load history');
        }
    };

    useEffect(() => {
        if (tab === 'design' && designSubTab === 'library') {
            fetchLibrary();
        }
    }, [tab, designSubTab]);

    const handleAIGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const endpoint = currentTemplate ? '/api/templates/refine' : '/api/templates/generate-variants';
            const body = currentTemplate 
                ? { currentTemplate, prompt: aiPrompt } 
                : { prompt: aiPrompt };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            
            if (Array.isArray(data)) {
                setVariants(data);
                setDesignSubTab('variants');
            } else {
                onTemplateSelect(data);
                setAiPrompt('');
                setDesignSubTab('library');
            }
        } catch (error) {
            alert('AI Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRestore = async (versionId: string) => {
        if (!currentTemplate) return;
        try {
            const res = await fetch(`/api/templates/${currentTemplate.id}/restore-version`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId })
            });
            const restored = await res.json();
            onTemplateSelect(restored);
            setDesignSubTab('library');
        } catch (err) {
            alert('Restore failed');
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            const res = await fetch(`/api/templates/${id}/duplicate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName: `Fork of ${id.slice(0, 6)}` })
            });
            const duplicated = await res.json();
            fetchLibrary();
            onTemplateSelect(duplicated);
        } catch (err) {
            alert('Duplicate failed');
        }
    };

    const handleSaveTemplate = async (template: Template) => {
        try {
            await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...template, metadata: { ...template.metadata, version: 1 } })
            });
            fetchLibrary();
            setDesignSubTab('library');
        } catch (err) {
            alert('Failed to save template');
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Permanently delete this style?')) return;
        try {
            await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            fetchLibrary();
        } catch (err) {
            alert('Delete failed');
        }
    };

    return (
        <aside className="w-[420px] border-r border-white/5 bg-zinc-950 flex flex-col h-full shrink-0 relative overflow-hidden">
            {/* Professional V3 Nav Tabs */}
            <div className="flex px-6 pt-6 gap-2">
                <button 
                    onClick={() => setTab('project')}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all ${tab === 'project' ? 'bg-zinc-900 border-white/10 text-white shadow-xl shadow-black/50' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Music4 size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Workspace</span>
                </button>
                <button 
                    onClick={() => setTab('design')}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all ${tab === 'design' ? 'bg-zinc-900 border-white/10 text-white shadow-xl shadow-black/50' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Palette size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Director</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar mt-6">
                {tab === 'project' ? (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2">
                        <section className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Project Context</label>
                            <input 
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                                placeholder="Untitled Lyric Production..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </section>

                        <section className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Raw Verse / Composition</label>
                            <textarea 
                                className="w-full h-80 bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-4 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none leading-relaxed font-medium"
                                placeholder="Paste or type full lyrics..."
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                            />
                        </section>

                        <button 
                            onClick={() => onProjectCreate(title, lyrics)}
                            className="w-full py-5 bg-white hover:bg-zinc-200 text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-[0.98] shadow-2xl shadow-white/5"
                        >
                            Build & Sync Pipeline
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        {/* Director Sub-Nav */}
                        <div className="flex gap-6 border-b border-white/5 pb-3">
                            {['generate', 'library'].map(st => (
                                <button 
                                    key={st}
                                    onClick={() => setDesignSubTab(st as any)}
                                    className={`text-[10px] font-black uppercase tracking-[0.15em] transition-all relative ${designSubTab === st ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {st}
                                    {designSubTab === st && <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-purple-500 rounded-full"/>}
                                </button>
                            ))}
                            {variants.length > 0 && (
                                <button onClick={() => setDesignSubTab('variants')} className={`text-[10px] font-black uppercase tracking-[0.15em] text-purple-400 animate-pulse`}>Variants</button>
                            )}
                        </div>

                        {designSubTab === 'generate' && (
                             <section className="flex flex-col gap-6">
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/5 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                                        <Wand2 size={80} />
                                    </div>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"/>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">AI ART DIRECTOR V3</label>
                                    </div>
                                    <div className="relative">
                                        <textarea 
                                            className="w-full h-32 bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none mb-4 placeholder:text-zinc-800 font-medium leading-relaxed"
                                            placeholder={currentTemplate ? "Refine current style (e.g. 'more gold', 'cleaner fonts')..." : "Describe visual intent (e.g. 'Neon trap vibes, huge text, dark background')..."}
                                            value={aiPrompt}
                                            onChange={e => setAiPrompt(e.target.value)}
                                        />
                                        <button 
                                            onClick={handleAIGenerate}
                                            disabled={!aiPrompt || isGenerating}
                                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                                        >
                                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <>Generate Variants <Send size={14} /></>}
                                        </button>
                                    </div>
                                </div>
                             </section>
                        )}

                        {designSubTab === 'variants' && (
                            <section className="flex flex-col gap-5 animate-in slide-in-from-right duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Interpretation Matrix</label>
                                        <p className="text-[9px] text-zinc-600 font-medium">3 directions analyzed for this production</p>
                                    </div>
                                    <button onClick={() => setDesignSubTab('generate')} className="text-[9px] text-purple-500 font-bold bg-purple-500/5 px-2 py-1 rounded">CLOSE</button>
                                </div>
                                <div className="grid grid-cols-1 gap-5">
                                    {variants.map((v, i) => (
                                        <div key={i} className="bg-zinc-900 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 group hover:border-purple-500/30 transition-all shadow-xl">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center border border-white/5 shadow-inner">
                                                        {v.type === 'safe' && <Shield size={14} className="text-emerald-500"/>}
                                                        {v.type === 'balanced' && <Scale size={14} className="text-blue-500"/>}
                                                        {v.type === 'bold' && <Zap size={14} className="text-purple-500"/>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-200">{v.type} PROPOSAL</span>
                                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Confidence Score: {v.score}%</span>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-black/50 rounded-full border border-white/5">
                                                    <span className={`text-[10px] font-black ${v.score > 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>{v.score}</span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                                <p className="text-[11px] font-medium text-zinc-500 leading-relaxed italic italic">"{v.explanation || 'Analyzed for maximum readability and visual impact.'}"</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => onTemplateSelect(v.template)} className="flex-1 py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200">Load Preview</button>
                                                <button onClick={() => handleSaveTemplate(v.template)} className="px-5 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all"><Check size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {designSubTab === 'library' && (
                            <section className="flex flex-col gap-8 animate-in fade-in duration-500 px-1">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2"><BookOpen size={12}/> Global Assets</label>
                                        <span className="text-[9px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full text-zinc-600 font-bold">{TEMPLATES_REGISTRY.length} STOCK</span>
                                    </div>
                                    <div className="space-y-2">
                                        {TEMPLATES_REGISTRY.map(t => (
                                            <button key={t.id} onClick={() => onTemplateSelect(t)} className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${activeTemplateId === t.id ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-900/30 border-white/5 text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
                                                <span className="text-[11px] font-bold">{t.name}</span>
                                                <span className="text-[9px] opacity-40 uppercase font-black tracking-widest">{t.ratio}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-white/5 pt-8">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2"><Layers size={12}/> Saved Library</label>
                                        <span className="text-[9px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full text-zinc-600 font-bold">{savedTemplates.length} CUSTOM</span>
                                    </div>
                                    {isLoadingLibrary ? (
                                        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-zinc-800"/></div>
                                    ) : savedTemplates.length === 0 ? (
                                        <div className="py-12 px-6 border border-dashed border-white/5 rounded-3xl text-center flex flex-col items-center gap-3">
                                            <Sparkles size={24} className="text-zinc-800" />
                                            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest italic">Personal vault is empty.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {savedTemplates.map(t => (
                                                <div key={t.id} className={`group w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${activeTemplateId === t.id ? 'bg-purple-500/5 border-purple-500/20 shadow-xl shadow-purple-500/5' : 'bg-zinc-900 border-white/5 hover:border-zinc-800'}`}>
                                                    <button onClick={() => onTemplateSelect(t)} className="flex-1 text-left flex flex-col gap-1">
                                                        <span className={`text-[12px] font-bold transition-all ${activeTemplateId === t.id ? 'text-purple-400' : 'text-zinc-200 group-hover:text-white'}`}>{t.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[8px] bg-zinc-950 text-zinc-600 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">V{t.metadata?.version || 1}</span>
                                                            {t.baseTemplateId && <span className="text-[8px] text-zinc-700 font-bold uppercase italic flex items-center gap-0.5"><Layers size={8}/> From Fork</span>}
                                                        </div>
                                                    </button>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button onClick={() => fetchHistory(t.id)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-600 hover:text-white" title="Lineage History"><HistoryIcon size={14}/></button>
                                                        <button onClick={() => handleDuplicate(t.id)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-600 hover:text-white" title="Duplicate Fork"><Copy size={14}/></button>
                                                        <button onClick={() => handleDeleteTemplate(t.id)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-600 hover:text-red-400" title="Delete Permanent"><Trash2 size={14}/></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {designSubTab === 'history' && (
                             <section className="flex flex-col gap-5 animate-in slide-in-from-right duration-500 px-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Design Lineage</label>
                                        <p className="text-[9px] text-zinc-600 font-medium">Chronological snapshots for this asset</p>
                                    </div>
                                    <button onClick={() => setDesignSubTab('library')} className="text-[9px] text-purple-500 font-bold bg-purple-500/5 px-2 py-1 rounded">GO BACK</button>
                                </div>
                                <div className="space-y-3">
                                    {templateHistory.map((v, i) => (
                                        <div key={v.id} className="p-4 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all shadow-lg">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-zinc-400 tracking-tighter uppercase tracking-widest">Snapshot {v.version}</span>
                                                    {i === 0 && <span className="text-[7px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">Active Head</span>}
                                                </div>
                                                <span className="text-[11px] text-zinc-500 font-medium italic line-clamp-1">"{v.prompt || 'Manual checkpoint'}"</span>
                                                <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-tighter">{new Date(v.createdAt).toLocaleString()}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleRestore(v.id)}
                                                className="p-3 opacity-0 group-hover:opacity-100 bg-zinc-950 border border-white/5 hover:bg-purple-600 text-white rounded-xl transition-all shadow-xl"
                                                title="Rollback to this state"
                                            >
                                                <RotateCcw size={14}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                             </section>
                        )}
                    </div>
                )}
            </div>

            {/* Performance Footer */}
            <div className="p-8 border-t border-white/5 bg-zinc-950 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-zinc-500">
                         <div className="relative">
                            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                                <Activity size={18} className="text-purple-500" />
                            </div>
                            {currentTemplate?.metadata?.qualityScore && currentTemplate.metadata.qualityScore > 80 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-pulse"/>
                            )}
                         </div>
                        <div className="flex flex-col">
                            <p className="text-[11px] font-black text-zinc-200 tracking-[0.1em] uppercase">Engine V3 PRO</p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{currentTemplate?.name || 'Loading Architecture...'}</p>
                        </div>
                    </div>
                    {currentTemplate?.metadata?.qualityScore && (
                        <div className="flex flex-col items-end gap-1.5">
                             <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase ${currentTemplate.metadata.qualityScore > 80 ? 'text-emerald-500' : 'text-yellow-500'}`}>{currentTemplate.metadata.qualityScore}% Health</span>
                             </div>
                             <div className="w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className={`h-full transition-all duration-1000 ${currentTemplate.metadata.qualityScore > 80 ? 'bg-emerald-500' : 'bg-yellow-500'}`} 
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
