'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { LyricVideoPro } from '@/remotion/compositions/LyricVideoPro';
import { Timeline, Template, ProjectScene } from '@/src/schemas';

interface PlayerProps {
    audioSrc: string;
    timeline: Timeline;
    template: Template;
    scenes?: ProjectScene[];
}

export const RemotionPlayerWrapper: React.FC<PlayerProps> = ({ audioSrc, timeline, template, scenes = [] }) => {
    const calculateDuration = () => {
        if (!timeline || !timeline.segments.length) return 1800; // 1 min fallback
        const lastEndMs = Math.max(...timeline.segments.map(s => s.endMs));
        return Math.ceil((lastEndMs / 1000) * 30) + 60; // adding 2 seconds margin
    };

    return (
        <div className="w-full h-full flex flex-col p-8 bg-zinc-900 overflow-hidden relative group">
            {/* SPRINT 7: Monitor Pro Top Bar */}
            <div className="absolute top-10 left-10 right-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-300">
                        {timeline?.segments.length || 0} Slice Markers
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-purple-400">
                        {scenes?.length || 0} Directed Scenes
                    </span>
                </div>
                <div />
            </div>

            <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="shadow-2xl shadow-black/80 aspect-[9/16] h-full rounded-2xl overflow-hidden border border-white/5 bg-black relative">
                    <Player
                        component={LyricVideoPro as any}
                        inputProps={{
                            audioSrc,
                            timeline,
                            globalTemplate: template,
                            scenes: scenes,
                            fps: 30
                        }}
                        durationInFrames={calculateDuration()}
                        fps={30}
                        compositionWidth={template.ratio === '16:9' ? 1920 : 1080}
                        compositionHeight={template.ratio === '16:9' ? 1080 : 1920}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        controls
                        loop
                    />
                </div>
            </div>

            {/* SPRINT 7: Scrubber / Waveform Footer */}
            <div className="mt-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center px-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Live Scrubber</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Active Syncing</span>
                </div>
                <div className="h-4 bg-zinc-950 rounded-full border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-purple-500/50 w-1/3 border-r border-purple-400" />
                    {/* Scene markers representation */}
                    {scenes.map(s => (
                        <div key={s.id} className="absolute inset-y-0 w-px bg-white/30" style={{ left: `${(s.startMs / (calculateDuration() / 30 * 1000)) * 100}%` }} />
                    ))}
                </div>
            </div>
        </div>
    );
};
