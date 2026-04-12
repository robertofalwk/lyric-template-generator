'use client';

import React, { useState } from 'react';
import { Upload, FileText, Layout, Settings, Wand2, Music4, Type, Palette } from 'lucide-react';
import { Template } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';

interface SidebarProps {
    onProjectCreate: (title: string, lyrics: string) => void;
    onTemplateSelect: (template: Template) => void;
    activeTemplateId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onProjectCreate, onTemplateSelect, activeTemplateId }) => {
    const [title, setTitle] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [tab, setTab] = useState<'project' | 'design'>('project');

    return (
        <aside className="w-[400px] border-r border-white/5 bg-zinc-950 flex flex-col h-full shrink-0">
            {/* Tab Switcheer */}
            <div className="flex p-1 bg-zinc-900 mx-6 mt-6 rounded-lg mb-6">
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

            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Visual Templates</label>
                        <div className="grid grid-cols-1 gap-4">
                            {TEMPLATES_REGISTRY.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => onTemplateSelect(t)}
                                    className={`group relative flex flex-col p-4 rounded-2xl border transition-all text-left ${
                                        activeTemplateId === t.id 
                                        ? 'bg-purple-500/10 border-purple-500/30' 
                                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-bold text-sm ${activeTemplateId === t.id ? 'text-purple-400' : 'text-zinc-200'}`}>
                                            {t.name}
                                        </h3>
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 font-bold border border-zinc-700">
                                            {t.ratio}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 line-clamp-1 italic">
                                        {t.fontFamily} • {t.highlightMode} mode
                                    </div>
                                    {activeTemplateId === t.id && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40">
                <div className="flex items-center gap-3 text-zinc-500">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        <Settings size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-400 leading-none">Settings</p>
                        <p className="text-[9px] text-zinc-600">Renderer Config v2.4</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
