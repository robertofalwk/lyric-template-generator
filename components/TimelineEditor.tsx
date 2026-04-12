'use client';

import React from 'react';
import { Timeline, Segment } from '@/types';
import { Clock, Scissors, ListRestart, Merge } from 'lucide-react';

interface TimelineEditorProps {
    timeline: Timeline;
    onChange: (newTimeline: Timeline) => void;
    currentTimeMs: number;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({ timeline, onChange, currentTimeMs }) => {
    
    const adjustGlobalOffset = (ms: number) => {
        const newTimeline = {
            ...timeline,
            segments: timeline.segments.map(s => ({
                ...s,
                startMs: s.startMs + ms,
                endMs: s.endMs + ms,
                words: s.words.map(w => ({
                    ...w,
                    startMs: w.startMs + ms,
                    endMs: w.endMs + ms
                }))
            }))
        };
        onChange(newTimeline);
    };

    const updateSegmentTiming = (id: string, startMs: number, endMs: number) => {
        const newTimeline = {
            ...timeline,
            segments: timeline.segments.map(s => 
                s.id === id ? { ...s, startMs, endMs } : s
            )
        };
        onChange(newTimeline);
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between underline-offset-4 mb-2">
                <span className="text-sm font-bold text-gray-400">OFFSET GLOBAL</span>
                <div className="flex gap-2">
                    <button onClick={() => adjustGlobalOffset(-100)} className="px-2 py-1 bg-gray-800 rounded text-xs">-100ms</button>
                    <button onClick={() => adjustGlobalOffset(100)} className="px-2 py-1 bg-gray-800 rounded text-xs">+100ms</button>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto flex flex-col gap-2 pr-2 custom-scrollbar">
                {timeline.segments.map((seg) => (
                    <div 
                        key={seg.id} 
                        className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors ${
                            currentTimeMs >= seg.startMs && currentTimeMs <= seg.endMs 
                            ? 'bg-purple-900/20 border-purple-500/50' 
                            : 'bg-gray-800/40 border-gray-700'
                        }`}
                    >
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                            <span>{(seg.startMs / 1000).toFixed(2)}s</span>
                            <div className="flex gap-2">
                                <button className="hover:text-purple-400"><Scissors size={12} /></button>
                                <button className="hover:text-purple-400"><Merge size={12} /></button>
                            </div>
                            <span>{(seg.endMs / 1000).toFixed(2)}s</span>
                        </div>
                        <input 
                            className="bg-transparent text-sm text-gray-200 outline-none focus:text-white"
                            value={seg.text}
                            onChange={(e) => {
                                const newSegs = timeline.segments.map(s => s.id === seg.id ? {...s, text: e.target.value} : s);
                                onChange({...timeline, segments: newSegs});
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
