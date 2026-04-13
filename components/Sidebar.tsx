'use client';

import React, { useState, useEffect } from 'react';
import { 
    Settings, Wand2, Music4, Palette, Sparkles, Send, 
    Loader2, Check, BookOpen, Star, Copy, Trash2, History,
    Shield, Scale, Zap, Info, ArrowLeft
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
    const [designSubTab, setDesignSubTab] = useState<'generate' | 'library' | 'variants'>('generate');
    
    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [variants, setVariants] = useState<TemplateVariation[]>([]);
    
    // Library State
    const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

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

    useEffect(() => {
        if (tab === 'design' && designSubTab === 'library') {
            fetchLibrary();
        }
    }, [tab, designSubTab]);

    const handleAIGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const endpoint = currentTemplate ? '/api/templates/refine' : '/api/templates/generate';
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

    const handleSaveTemplate = async (template: Template) => {
        try {
            await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
            });
            fetchLibrary();
            setDesignSubTab('library');
        } catch (err) {
            alert('Failed to save template');
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            fetchLibrary();
        } catch (err) {
            alert('Delete failed');
        }
    };

    return (
        <aside className="w-[400px] border-r border-white/5 bg-zinc-950 flex flex-col h-full shrink-0 relative overflow-hidden">
            {/* Tab Switcheer */}
            <div className="flex p-1 bg-zinc-900 mx-6 mt-6 rounded-lg mb-6 z-10">
                <button 
                    onClick={() => setTab('project')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${tab === 'project' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Music4 size={14} /> PROJECT
                </button>
                <button 
                    onClick={() => setTab('design')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${tab === 'design' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Palette size={14} /> DESIGN
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar z-10">
                {tab === 'project' ? (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                        <section className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Project Title</label>
                            <input 
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                                placeholder="Summer Vibes 2026..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </section>

                        <section className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Original Lyrics</label>
                            <textarea 
                                className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none leading-relaxed"
                                placeholder="Paste lyrics here..."
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                            />
                        </section>

                        <button 
                            onClick={() => onProjectCreate(title, lyrics)}
                            className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-white/5"
                        >
                            Create & Analyze
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        {/* Design Sub-Tabs */}
                        <div className="flex gap-4 border-b border-white/5 pb-2">
                            <button 
                                onClick={() => setDesignSubTab('generate')}
                                className={`text-[10px] font-black uppercase tracking-widest transition-all ${designSubTab === 'generate' ? 'text-purple-400' : 'text-zinc-600'}`}
                            >
                                AI Assistant
                            </button>
                            <button 
                                onClick={() => setDesignSubTab('library')}
                                className={`text-[10px] font-black uppercase tracking-widest transition-all ${designSubTab === 'library' ? 'text-purple-400' : 'text-zinc-600'}`}
                            >
                                Library
                            </button>
                            {variants.length > 0 && (
                                <button 
                                    onClick={() => setDesignSubTab('variants')}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-all ${designSubTab === 'variants' ? 'text-purple-400' : 'text-zinc-600'}`}
                                >
                                    Variants
                                </button>
                            )}
                        </div>

                        {designSubTab === 'generate' && (
                             <section className="flex flex-col gap-4 animate-in slide-in-from-left duration-300">
                                <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-500/10 via-zinc-900 to-zinc-900 border border-purple-500/20 shadow-xl shadow-purple-500/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles size={16} className="text-purple-400" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Directional AI</label>
                                    </div>
                                    <div className="relative">
                                        <textarea 
                                            className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none leading-relaxed mb-3 placeholder:text-zinc-700"
                                            placeholder={currentTemplate ? "Refine (e.g. 'more editorial', 'bold fonts')..." : "Direction (e.g. 'Neon trap vibes, big centered text')..."}
                                            value={aiPrompt}
                                            onChange={e => setAiPrompt(e.target.value)}
                                        />
                                        <button 
                                            onClick={handleAIGenerate}
                                            disabled={!aiPrompt || isGenerating}
                                            className="absolute bottom-6 right-3 p-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-20 text-white rounded-lg transition-all shadow-lg shadow-purple-500/20"
                                        >
                                            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                        </button>
                                    </div>
                                </div>
                             </section>
                        )}

                        {designSubTab === 'variants' && (
                            <section className="flex flex-col gap-4 animate-in slide-in-from-right duration-300">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pick a Direction</label>
                                    <button onClick={() => setDesignSubTab('generate')} className="text-[9px] text-purple-500 font-bold flex items-center gap-1"><ArrowLeft size={10}/> BACK</button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {variants.map((v, i) => (
                                        <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:border-purple-500/30 transition-all">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    {v.type === 'safe' && <Shield size={12} className="text-green-500"/>}
                                                    {v.type === 'balanced' && <Scale size={12} className="text-blue-500"/>}
                                                    {v.type === 'bold' && <Zap size={12} className="text-purple-500"/>}
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{v.type}</span>
                                                </div>
                                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.score > 80 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                    Score: {v.score}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 italic leading-relaxed">{v.explanation}</p>
                                            <div className="flex gap-2 pt-2">
                                                <button 
                                                    onClick={() => onTemplateSelect(v.template)}
                                                    className="flex-1 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-all"
                                                >
                                                    Preview
                                                </button>
                                                <button 
                                                    onClick={() => handleSaveTemplate(v.template)}
                                                    className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-all"
                                                >
                                                    <Check size={14}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {designSubTab === 'library' && (
                            <section className="flex flex-col gap-4 animate-in fade-in duration-300">
                                <div className="space-y-6">
                                    {/* Stock Section */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><BookOpen size={10}/> Registry</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {TEMPLATES_REGISTRY.map(t => (
                                                <button key={t.id} onClick={() => onTemplateSelect(t)} className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition-all ${activeTemplateId === t.id ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-zinc-900/30 border-white/5 text-zinc-500 hover:border-zinc-700'}`}>
                                                    <span className="text-[11px] font-bold">{t.name}</span>
                                                    <span className="text-[9px] opacity-40 uppercase">{t.ratio}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Saved Section */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Star size={10}/> Custom Library</label>
                                        {isLoadingLibrary ? (
                                            <div className="flex justify-center py-8"><Loader2 size={16} className="animate-spin text-zinc-700"/></div>
                                        ) : savedTemplates.length === 0 ? (
                                            <p className="text-[10px] text-zinc-600 text-center py-8 italic border border-dashed border-white/5 rounded-xl">No templates saved yet.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2">
                                                {savedTemplates.map(t => (
                                                    <div key={t.id} className={`group w-full p-3 rounded-lg border text-left flex justify-between items-center transition-all ${activeTemplateId === t.id ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-900 border-white/5 hover:border-zinc-700'}`}>
                                                        <button onClick={() => onTemplateSelect(t)} className="flex-1 text-left">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[11px] font-bold ${activeTemplateId === t.id ? 'text-purple-400' : 'text-zinc-200'}`}>{t.name}</span>
                                                                {t.metadata?.version && t.metadata.version > 1 && <span className="text-[8px] bg-zinc-800 text-zinc-500 px-1 rounded">V{t.metadata.version}</span>}
                                                            </div>
                                                        </button>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button onClick={() => handleDeleteTemplate(t.id)} className="text-zinc-600 hover:text-red-400"><Trash2 size={12}/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-zinc-500">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                            <Zap size={14} className="text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 leading-none">Art Director</p>
                            <p className="text-[9px] text-zinc-600">v2.0 Pro Engine</p>
                        </div>
                    </div>
                    {currentTemplate?.metadata?.qualityScore && (
                        <div className="flex flex-col items-end">
                             <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Health Score</div>
                             <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${currentTemplate.metadata.qualityScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${currentTemplate.metadata.qualityScore}%` }} />
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
