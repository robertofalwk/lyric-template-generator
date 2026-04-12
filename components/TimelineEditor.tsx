'use client';

import React from 'react';
import { Timeline, Segment } from '@/src/schemas';
import { Clock, Scissors, ListRestart, Merge, SplitSquareVertical, GripVertical, ChevronRight } from 'lucide-react';

interface TimelineEditorProps {
    timeline: Timeline;
    onChange: (newTimeline: Timeline) => void;
    currentTimeMs: number;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({ timeline, onChange, currentTimeMs }) => {
    
    return (
        <div className="flex flex-col h-full bg-zinc-950/50 rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 shrink-0">
                <div className="flex items-center gap-2">
                    <ListRestart size={14} className="text-purple-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Timeline Blocks</span>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold rounded-full border border-zinc-800 transition-colors">
                        Auto-Split
                    </button>
                    <button className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold rounded-full border border-zinc-800 transition-colors">
                        Re-Sync
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                {timeline.segments.map((seg, idx) => {
                    const isActive = currentTimeMs >= seg.startMs && currentTimeMs <= seg.endMs;
                    
                    return (
                        <div 
                            key={seg.id} 
                            className={`group rounded-xl border transition-all duration-300 ${
                                isActive 
                                ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/5 translate-x-1' 
                                : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="flex items-start p-4 gap-4">
                                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-purple-500 animate-pulse' : 'bg-zinc-700'}`} />
                                
                                <div className="flex-1 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
                                            <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">{(seg.startMs / 1000).toFixed(2)}s</span>
                                            <ChevronRight size={10} />
                                            <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">{(seg.endMs / 1000).toFixed(2)}s</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-all">
                                                <Merge size={14} />
                                            </button>
                                            <button className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-all">
                                                <SplitSquareVertical size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <textarea 
                                        className="bg-transparent text-sm text-zinc-200 outline-none focus:text-white w-full resize-none leading-relaxed font-medium"
                                        rows={1}
                                        value={seg.text}
                                        onChange={(e) => {
                                            const newSegs = [...timeline.segments];
                                            newSegs[idx] = { ...seg, text: e.target.value };
                                            onChange({ ...timeline, segments: newSegs });
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-1 items-center justify-center text-zinc-700">
                                    <GripVertical size={16} className="cursor-grab active:cursor-grabbing hover:text-zinc-500" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="p-4 bg-black/40 border-t border-white/5">
                <div className="flex justify-between items-center px-2">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Total Slices: {timeline.segments.length}</span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Global Drift: +0ms</span>
                </div>
            </div>
        </div>
    );
};
