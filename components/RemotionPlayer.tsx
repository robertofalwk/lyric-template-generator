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
        <div className="w-full h-full flex items-center justify-center p-8 bg-zinc-900 overflow-hidden">
            <div className="shadow-2xl shadow-black/50 aspect-[9/16] h-full max-h-[800px] rounded-2xl overflow-hidden border border-white/5">
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
    );
};
