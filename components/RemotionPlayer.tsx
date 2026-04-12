'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { LyricVideo } from '@/remotion/compositions/LyricVideo';
import { Timeline, Template } from '@/src/schemas';

interface PlayerProps {
    audioSrc: string;
    timeline: Timeline;
    template: Template;
}

export const RemotionPlayerWrapper: React.FC<PlayerProps> = ({ audioSrc, timeline, template }) => {
    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-zinc-900 overflow-hidden">
            <div className="shadow-2xl shadow-black/50 aspect-[9/16] h-full max-h-[800px] rounded-2xl overflow-hidden border border-white/5">
                <Player
                    component={LyricVideo}
                    inputProps={{
                        audioSrc,
                        timeline,
                        template
                    }}
                    durationInFrames={1800} // Default 1 min, should be dynamic in a real app
                    fps={30}
                    compositionWidth={1080}
                    compositionHeight={1920}
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
