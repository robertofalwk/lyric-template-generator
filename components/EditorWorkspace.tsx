'use client';

import React, { useState } from 'react';
import { Project, Timeline, Template, ProjectScene } from '@/src/schemas';
import { TimelineEditor } from './TimelineEditor';
import { 
    Paintbrush, AlignLeft, Layers, Sliders, ChevronDown, 
    Download, Play, FastForward, Film, Type, Star, Sparkles, Image as ImageIcon
} from 'lucide-react';

interface EditorWorkspaceProps {
    project: Project;
    timeline: Timeline;
    scenes: ProjectScene[];
    template: Template;
    onProjectUpdate: (updates: Partial<Project>) => void;
    onTimelineUpdate: (timeline: Timeline) => void;
    onTemplateUpdate: (template: Template) => void;
    onScenesUpdate: (scenes: ProjectScene[]) => void;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
    project, timeline, scenes, template, 
    onProjectUpdate, onTimelineUpdate, onTemplateUpdate, onScenesUpdate
}) => {
    const [subTab, setSubTab] = useState<'style' | 'lyrics' | 'scenes' | 'assets' | 'ai'>('style');


    const handleSrtExport = () => {
        let srtContent = '';
        timeline.segments.forEach((seg, i) => {
            const formatTime = (ms: number) => {
                const date = new Date(ms);
                const h = String(date.getUTCHours()).padStart(2, '0');
                const m = String(date.getUTCMinutes()).padStart(2, '0');
                const s = String(date.getUTCSeconds()).padStart(2, '0');
                const msStr = String(date.getUTCMilliseconds()).padStart(3, '0');
                return `${h}:${m}:${s},${msStr}`;
            };
            srtContent += `${i + 1}\n${formatTime(seg.startMs)} --> ${formatTime(seg.endMs)}\n${seg.text}\n\n`;
        });
        const blob = new Blob([srtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title || 'lyrics'}.srt`;
        a.click();
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
            {/* Editor Topbar */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 bg-black/40 shrink-0">
                <div className="flex gap-4 h-full">
                    {[
                        { id: 'style', icon: Paintbrush, label: 'Style Lab' },
                        { id: 'lyrics', icon: AlignLeft, label: 'Lyrics Engine' },
                        { id: 'scenes', icon: Layers, label: 'Scene Director' },
                        { id: 'assets', icon: ImageIcon, label: 'Asset Hub' },
                        { id: 'ai', icon: Sparkles, label: 'AI Workspace' }
                    ].map(st => (
                        <button 
                            key={st.id}
                            onClick={() => setSubTab(st.id as any)}
                            className={`flex items-center gap-2 h-full text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${
                                subTab === st.id ? 'border-purple-500 text-purple-400' : 'border-transparent text-zinc-600 hover:text-zinc-400'
                            }`}
                        >
                            <st.icon size={14}/> {st.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                
                {/* --- SPRINT 3: STYLE LAB --- */}
                {subTab === 'style' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-left duration-500">
                        <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                                <Sliders size={14}/> Visual Modifiers (Studio Pro)
                            </label>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {/* Core Controls */}
                                <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                        <span>Glow Radius</span>
                                        <span className="text-purple-400">{template.glowRadius || 0}px</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="100" 
                                        value={template.glowRadius || 0}
                                        onChange={e => onTemplateUpdate({...template, glow: true, glowRadius: Number(e.target.value)})}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                                <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                        <span>Stroke Width</span>
                                        <span className="text-purple-400">{template.strokeWidth || 0}px</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="20" 
                                        value={template.strokeWidth || 0}
                                        onChange={e => onTemplateUpdate({...template, strokeWidth: Number(e.target.value)})}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                                <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                        <span>Chromatic Aberration</span>
                                        <span className="text-purple-400">{template.visualFx?.chromaticAberration || 0}</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="20" 
                                        value={template.visualFx?.chromaticAberration || 0}
                                        onChange={e => onTemplateUpdate({...template, visualFx: { ...template.visualFx, chromaticAberration: Number(e.target.value) }})}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-4">
                                <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Platform Presets</label>
                                <div className="flex gap-4">
                                    {['Shorts (9:16)', 'Reels (9:16)', 'TikTok (9:16)', 'Landscape (16:9)'].map(preset => (
                                        <button 
                                            key={preset}
                                            onClick={() => onProjectUpdate({ aspectRatio: preset.includes('16:9') ? '16:9' : '9:16' })}
                                            className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                project.aspectRatio === (preset.includes('16:9') ? '16:9' : '9:16') 
                                                ? 'bg-white text-black border-white' 
                                                : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* --- SPRINT 4: LYRICS ENGINE --- */}
                {subTab === 'lyrics' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-left duration-500 h-full">
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                                    <Type size={14}/> Text Behaviors
                                </label>
                                <button 
                                    onClick={handleSrtExport}
                                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white flex items-center gap-2 transition-all"
                                >
                                    <Download size={14}/> Export .SRT
                                </button>
                            </div>
                            
                            <div className="flex gap-4">
                                {['word_by_word', 'karaoke_bar', 'chunk', 'rolling_lines', 'cinematic_blocks'].map(mode => (
                                    <button 
                                        key={mode}
                                        onClick={() => onTemplateUpdate({...template, textBehavior: { ...template.textBehavior, mode: mode as any }})}
                                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border transition-all ${
                                            template.textBehavior?.mode === mode 
                                            ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                                            : 'bg-zinc-900 border-white/5 text-zinc-600 hover:text-zinc-400 hover:border-white/10'
                                        }`}
                                    >
                                        {mode.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="flex-1 min-h-[400px]">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 mb-4">
                                <FastForward size={14}/> Transcript Alignment Grid
                            </label>
                            <TimelineEditor 
                                timeline={timeline} 
                                onChange={onTimelineUpdate} 
                                currentTimeMs={0} 
                            />
                        </section>
                    </div>
                )}

                {/* --- SPRINT 5: SCENE DIRECTOR --- */}
                {subTab === 'scenes' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-left duration-500">
                        <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                                <Film size={14}/> Master Scene Manifest
                            </label>
                            <div className="space-y-4">
                                {scenes.map((s, idx) => (
                                    <div key={s.id} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col gap-4 group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[14px] font-bold text-white">Scene {idx + 1}</span>
                                                    <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-widest rounded-md">
                                                        {s.sectionType}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-zinc-500 font-mono uppercase">
                                                    {(s.startMs / 1000).toFixed(1)}s — {(s.endMs / 1000).toFixed(1)}s
                                                </span>
                                            </div>
                                            <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[9px] font-black uppercase tracking-widest text-zinc-300 rounded-lg">
                                                    Regenerate
                                                </button>
                                                <button className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-[9px] font-black uppercase tracking-widest text-rose-500 rounded-lg">
                                                    Split
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4 pt-4 border-t border-white/5">
                                            <div className="flex-1 flex flex-col gap-2">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Visual Intensity</span>
                                                <div className="flex gap-2">
                                                    {['low', 'medium', 'high'].map(int => (
                                                        <button 
                                                            key={int}
                                                            onClick={async () => {
                                                                const newScenes = [...scenes];
                                                                newScenes[idx] = { ...s, intensity: int as any };
                                                                onScenesUpdate(newScenes);
                                                            }}
                                                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                                                s.intensity === int 
                                                                ? 'bg-zinc-800 text-white border-white/10' 
                                                                : 'bg-transparent text-zinc-600 border-transparent hover:bg-zinc-950'
                                                            }`}
                                                        >
                                                            {int}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 flex flex-col gap-2">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Section Role</span>
                                                <select 
                                                    value={s.sectionType}
                                                    onChange={async (e) => {
                                                        const newScenes = [...scenes];
                                                        newScenes[idx] = { ...s, sectionType: e.target.value as any };
                                                        onScenesUpdate(newScenes);
                                                    }}
                                                    className="w-full bg-zinc-950 border border-white/10 rounded-lg py-1.5 px-3 text-[10px] font-bold text-zinc-300 uppercase tracking-widest outline-none focus:border-purple-500"
                                                >
                                                    {['intro', 'verse', 'pre-chorus', 'chorus', 'bridge', 'outro', 'custom'].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
                {/* --- SPRINT 6: ASSET HUB --- */}
                {subTab === 'assets' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-left duration-500">
                        <section className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                                <ImageIcon size={14}/> Background Art Providers
                            </label>
                            <div className="flex gap-4 border-b border-white/5 pb-4">
                                {['My Assets', 'Pexels', 'Unsplash', 'Pixabay'].map(prov => (
                                    <button 
                                        key={prov}
                                        className="px-4 py-2 bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        {prov}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Placeholder Assets */}
                                {[1,2,3,4].map(a => (
                                    <div key={a} className="aspect-[9/16] bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                            <span className="text-[8px] text-white font-black uppercase tracking-widest">Asset #{a}</span>
                                        </div>
                                        <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <button className="px-4 py-2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl">Apply</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* --- SPRINT 9: AI DIRECTOR WORKSPACE --- */}
                {subTab === 'ai' && (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-left duration-500">
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                                    <Sparkles size={14}/> AI Director Audit
                                </label>
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                    Provider: Local Heuristic
                                </span>
                            </div>
                            <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col gap-4">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">JSON Output Log</span>
                                <pre className="p-4 bg-black/50 border border-white/5 rounded-xl text-[10px] text-emerald-400 font-mono overflow-auto max-h-64">
                                    {JSON.stringify({ 
                                        visual_intent: template.textBehavior,
                                        scene_manifest: scenes.map(s => ({ id: s.id, type: s.sectionType, intensity: s.intensity })) 
                                    }, null, 2)}
                                </pre>
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 py-3 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20">
                                    Regenerate Visual Intent
                                </button>
                                <button className="flex-1 py-3 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 hover:text-white transition-all border border-white/5">
                                    Force Local Fallback
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};
