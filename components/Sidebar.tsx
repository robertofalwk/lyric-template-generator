'use client';

import React, { useState, useEffect } from 'react';
import { 
    Wand2, Palette, Sparkles, Send, 
    Loader2, Check, Activity, Layers, 
    Image as ImageIcon, CheckCircle, 
    ChevronRight, ListChecks, Download,
    Cpu, RefreshCw, Zap
} from 'lucide-react';
import { Project, ProjectScene, ProjectComment, Template, TemplateVariation } from '@/src/schemas';

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
    const [tab, setTab] = useState<'monitor' | 'director' | 'review' | 'publish'>('monitor');
    
    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [variants, setVariants] = useState<TemplateVariation[]>([]);
    const [aiStatus, setAiStatus] = useState<'idle' | 'interpreting' | 'fallback'>('idle');

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
            {/* V6 Studio Navigation */}
            <div className="flex h-20 border-b border-white/5 bg-black/40 px-6 items-center justify-between">
                <div className="flex gap-2">
                    {['monitor', 'director', 'review', 'publish'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all px-3 py-2.5 rounded-xl border ${tab === t ? 'bg-zinc-800 border-white/10 text-white shadow-xl shadow-black' : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className={`w-2 h-2 rounded-full ${aiStatus === 'interpreting' ? 'bg-blue-500 animate-pulse' : aiStatus === 'fallback' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}/>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar mt-10">
                {tab === 'monitor' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-left duration-500">
                        <section className="flex flex-col gap-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Studio Context</label>
                            <input 
                                className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 font-bold"
                                placeholder="Production Title..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </section>
                        <section className="flex flex-col gap-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Narrative Draft</label>
                            <textarea 
                                className="w-full h-80 bg-zinc-900 border border-white/5 rounded-2xl px-6 py-6 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none font-medium leading-relaxed"
                                placeholder="Lyrics source..."
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                            />
                        </section>
                        <button 
                            onClick={() => onProjectCreate(title, lyrics)}
                            className="w-full py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl shadow-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all"
                        >
                            Sync Studio Signals
                        </button>
                    </div>
                )}

                {tab === 'director' && (
                    <div className="flex flex-col gap-10 animate-in slide-in-from-right duration-500">
                        {/* Generation Panel */}
                        <section className="p-10 rounded-[2.5rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 shadow-2xl relative overflow-hidden">
                            {aiStatus === 'fallback' && (
                                <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-[8px] font-black uppercase tracking-widest">
                                    <Cpu size={10}/> Local Core
                                </div>
                            )}
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-6 block">Visual Intent AI</label>
                            <textarea 
                                className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none mb-6 font-medium leading-relaxed"
                                placeholder="Direct the scene style..."
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                            />
                            <button 
                                onClick={handleAIGenerate}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-3"
                            >
                                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14}/> Interpret Direction</>}
                            </button>
                        </section>

                        {/* Refinement Panel (NEW) */}
                        {currentTemplate && (
                            <section className="p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 shadow-2xl">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6 block">Fine-Tune Active Master</label>
                                <div className="relative group">
                                    <input 
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-medium group-hover:border-white/10 transition-all"
                                        placeholder="e.g., Make text yellow and bigger..."
                                        value={refinePrompt}
                                        onChange={e => setRefinePrompt(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAIRefine()}
                                    />
                                    <button 
                                        onClick={handleAIRefine}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-all disabled:opacity-30"
                                        disabled={isRefining}
                                    >
                                        {isRefining ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                                    </button>
                                </div>
                                <div className="mt-6 flex justify-between items-center px-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Lineage: {currentTemplate.metadata?.aiMode || 'Manual'}</span>
                                    {currentTemplate.metadata?.providerUsed === 'openai' && <span className="text-[8px] bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded uppercase font-black">Powered by GPT4o</span>}
                                </div>
                            </section>
                        )}
                        
                        {variants.length > 0 && (
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 px-2">Proposed Variations</label>
                                {variants.map((v, i) => (
                                    <div key={i} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col gap-4 group hover:border-purple-500/30 transition-all">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-zinc-400 flex items-center gap-2"><Layers size={14}/> {v.type}</span>
                                            <span className={v.score > 80 ? 'text-emerald-500 font-bold' : 'text-yellow-500 font-bold'}>{v.score}% Health</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 italic leading-relaxed">"{v.explanation}"</p>
                                        <button 
                                            onClick={() => onTemplateSelect(v.template)}
                                            className="w-full py-4 bg-white text-black text-[9px] font-black uppercase tracking-[0.4em] rounded-xl hover:bg-zinc-200 transition-all shadow-xl shadow-black/20"
                                        >
                                            Activate Variation
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'review' && (
                    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                         <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 flex items-center gap-2">
                                <ListChecks size={14}/> Quality Gates
                            </label>
                            <div className="space-y-3 opacity-40">
                                {['Minimum Scene Score', 'Timeline Integrity', 'Social Safe-Zones'].map(l => (
                                    <div key={l} className="p-4 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-zinc-400">{l}</span>
                                        <CheckCircle size={16} className="text-emerald-800"/>
                                    </div>
                                ))}
                            </div>
                         </section>
                    </div>
                )}
            </div>

            {/* V6 High-Fidelity Studio Footer */}
            <div className="p-10 border-t border-white/5 bg-zinc-950 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-all"/>
                             <Activity size={18} className="text-purple-500 relative z-10 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[11px] font-black text-zinc-200 tracking-[0.1em] uppercase">Studio Master V6</p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{currentTemplate?.name || 'Awaiting Signal...'}</p>
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
