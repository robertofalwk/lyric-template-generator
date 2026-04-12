'use client';

import { Player } from '@remotion/player';
import { LyricVideo } from '@/remotion/compositions/LyricVideo';
import { Timeline, Template } from '@/types';

interface RemotionPlayerProps {
    audioUrl: string;
    timeline: Timeline;
    template: Template;
}

export const RemotionPlayerWrapper: React.FC<RemotionPlayerProps> = ({ audioUrl, timeline, template }) => {
    // If no timeline, show placeholder
    if (!timeline.segments.length) {
        return (
            <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800">
                <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">🎬</div>
                    <p>Upload audio and lyrics to see the preview</p>
                </div>
            </div>
        );
    }

    const { ratio } = template;
    const width = ratio === '9:16' ? 1080 : 1920;
    const height = ratio === '9:16' ? 1920 : 1080;

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="relative shadow-2xl shadow-black rounded-lg overflow-hidden border border-gray-800" style={{ 
                aspectRatio: ratio === '9:16' ? '9/16' : '16/9',
                maxHeight: '100%',
                backgroundColor: '#000'
            }}>
                <Player
                    component={LyricVideo}
                    durationInFrames={3600} // 2 mins at 30fps
                    fps={30}
                    compositionWidth={width}
                    compositionHeight={height}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    controls
                    inputProps={{
                        audioUrl,
                        timeline,
                        template
                    }}
                />
            </div>
        </div>
    );
};
