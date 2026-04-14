import { loadFont } from '@remotion/google-fonts/Inter';
import { Composition } from 'remotion';
import React from 'react';

loadFont();
import { LyricVideo } from './compositions/LyricVideo';
import { Timeline, Template } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';

// Default props for CLI rendering or testing
const defaultTimeline: Timeline = {
    segments: [
        {
            id: '1',
            text: 'Loading sync data...',
            startMs: 0,
            endMs: 2000,
            words: [{ text: 'Loading', startMs: 0, endMs: 2000 }]
        }
    ]
};

const defaultTemplate = TEMPLATES_REGISTRY[0];

export const RemotionRoot: React.FC = () => {
    const LyricVideoComponent = LyricVideo as unknown as React.ComponentType<Record<string, unknown>>;

    return (
        <>
            <Composition
                id="LyricVideo"
                component={LyricVideoComponent}
                durationInFrames={1800} // 1 minute @ 30fps
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    audioSrc: '',
                    timeline: defaultTimeline,
                    template: defaultTemplate
                }}
            />
            {/* 16:9 variant */}
            <Composition
                id="LyricVideoLandscape"
                component={LyricVideoComponent}
                durationInFrames={1800}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    audioSrc: '',
                    timeline: defaultTimeline,
                    template: { ...defaultTemplate, ratio: '16:9' } as Template
                }}
            />
        </>
    );
};
