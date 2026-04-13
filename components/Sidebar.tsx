'use client';

import React, { useState, useEffect } from 'react';
import { 
    Wand2, Music4, Palette, Sparkles, Send, 
    Loader2, Check, Copy, Trash2, History as HistoryIcon,
    Shield, Scale, Zap, Activity, Layers, 
    Image as ImageIcon, Film, Plus, CheckCircle, Clock,
    ChevronRight, BookOpen, MessageSquare, AlertTriangle, ShieldCheck, Rocket, ListChecks, Download
} from 'lucide-react';
import { Project, ProjectScene, ProjectComment, Template } from '@/src/schemas';

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
    
    // Ops State
    const [comments, setComments] = useState<ProjectComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Mocks / V6 Data
    const qualityChecks = [
        { label: 'Minimum Scene Score', passed: true, severity: 'warning' },
        { label: 'Timeline Integrity', passed: true, severity: 'blocking' },
        { label: 'Social Safe-Zones', passed: true, severity: 'blocking' },
        { label: 'Audio Frequency Sync', passed: false, severity: 'warning' }
    ];

    const renderHistory = [
        { date: '2026-04-13 14:00', version: 'V3 Master', status: 'completed', preset: '9:16 Reels' },
        { date: '2026-04-12 18:30', version: 'V2 Draft', status: 'completed', preset: '16:9 Youtube' }
    ];

    const handleAddComment = () => {
        if (!newComment) return;
        const comment: ProjectComment = {
            id: Math.random().toString(36),
            projectId: 'current',
            message: newComment,
            type: 'note',
            status: 'open',
            createdAt: new Date().toISOString()
        };
        setComments([...comments, comment]);
        setNewComment('');
    };

    return (
        <aside className="w-[440px] border-r border-white/5 bg-zinc-950 flex flex-col h-full shrink-0 relative overflow-hidden">
            {/* V6 Segmented Studio Navigation */}
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
                <div className={`w-2 h-2 rounded-full ${tab === 'review' ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}/>
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
                        <section className="p-10 rounded-[2.5rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 shadow-2xl">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-6 block">Visual Intent AI</label>
                            <textarea 
                                className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none mb-6 font-medium"
                                placeholder="Direct the scene style..."
                            />
                            <button className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 transition-all">
                                Interpret
                            </button>
                        </section>
                        
                        <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Studio Catalog</label>
                             <div className="grid grid-cols-1 gap-3">
                                 {['Trap Dark', 'Pop Clean', 'Cinematic Widescreen'].map(s => (
                                     <div key={s} className="p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-zinc-800 transition-all cursor-pointer flex justify-between items-center group">
                                         <span className="text-[12px] font-bold text-zinc-400 group-hover:text-white">{s}</span>
                                         <ChevronRight size={14} className="text-zinc-800 group-hover:text-white" />
                                     </div>
                                 ))}
                             </div>
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
                                {qualityChecks.map(c => (
                                    <div key={c.label} className="p-4 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-zinc-400">{c.label}</span>
                                        {c.passed ? <CheckCircle size={16} className="text-emerald-500"/> : <AlertTriangle size={16} className="text-yellow-500"/>}
                                    </div>
                                ))}
                            </div>
                         </section>

                         <section className="flex flex-col gap-6 border-t border-white/5 pt-10">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 flex items-center gap-2">
                                <MessageSquare size={14}/> Review Comments
                            </label>
                            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                                {comments.map(c => (
                                    <div key={c.id} className="p-4 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col gap-2">
                                        <p className="text-[11px] text-zinc-300 font-medium">"{c.message}"</p>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                                    placeholder="Add studio note..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                />
                                <button onClick={handleAddComment} className="px-4 bg-purple-600 text-white rounded-xl"><Send size={14}/></button>
                            </div>
                         </section>

                         <button className="w-full py-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl hover:bg-emerald-500/20 transition-all shadow-xl shadow-emerald-500/5">
                            Approve for Render
                         </button>
                    </div>
                )}

                {tab === 'publish' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-5 duration-600">
                        <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 flex items-center gap-2">
                                <Rocket size={14}/> Final Publishing
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['TikTok 9:16', 'Youtube 16:9', 'Reels 9:16', 'Master 4K'].map(p => (
                                    <button key={p} className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/20 transition-all text-center">
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="flex flex-col gap-6 border-t border-white/5 pt-10">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 flex items-center gap-2">
                                <HistoryIcon size={14}/> Render History
                            </label>
                            <div className="space-y-3">
                                {renderHistory.map((r, i) => (
                                    <div key={i} className="p-5 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-between group hover:border-purple-500/20 transition-all">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-bold text-zinc-300">{r.version}</span>
                                            <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{r.preset} • {r.date}</span>
                                        </div>
                                        <button className="p-2.5 bg-zinc-950 text-zinc-600 group-hover:text-emerald-500 transition-all"><Download size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* V6 High-Fidelity Studio Footer */}
            <div className="p-10 border-t border-white/5 bg-zinc-950 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-all"/>
                             <Activity size={18} className="text-purple-500 relative z-10 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[11px] font-black text-zinc-200 tracking-[0.1em] uppercase">Studio Master V6</p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{currentTemplate?.name || 'Loading Ops Node...'}</p>
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
