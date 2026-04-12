import { Audio, AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import React from 'react';
import { Template, Timeline, Segment } from '@/types';

export const LyricVideo: React.FC<{
    audioSrc: string;
    timeline: Timeline;
    template: Template;
}> = ({ audioSrc, timeline, template }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;

    // Find active segment
    const activeSegment = timeline.segments.find(
        (s) => currentTimeMs >= s.startMs && currentTimeMs <= s.endMs
    );

    // Animation progress
    const entrance = spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 100 }
    });

    const getAnimationStyle = (mode: string) => {
        switch(mode) {
            case 'zoom': return { transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1])})`, opacity: entrance };
            case 'slide-up': return { transform: `translateY(${interpolate(entrance, [0, 1], [50, 0])}px)`, opacity: entrance };
            case 'fade': return { opacity: entrance };
            default: return {};
        }
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor: template.backgroundMode === 'color' ? template.backgroundColor : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: template.safeArea ? '100px 60px' : '0',
    };

    const textStyle: React.CSSProperties = {
        fontFamily: template.fontFamily,
        fontSize: template.fontSize,
        color: template.textColor,
        textAlign: 'center',
        width: '90%',
        position: 'absolute',
        top: `${template.positionY}%`,
        transform: 'translateY(-50%)',
        WebkitTextStroke: `${template.strokeWidth}px ${template.strokeColor}`,
        filter: template.glowColor ? `drop-shadow(0 0 ${template.glowRadius}px ${template.glowColor})` : 'none',
        lineHeight: 1.2,
        ...getAnimationStyle(template.animationIn)
    };

    return (
        <AbsoluteFill style={containerStyle}>
            {audioSrc && <Audio src={audioSrc} />}
            
            {/* Background Layer (Mock Blur) */}
            {template.backgroundMode === 'blur' && (
                <AbsoluteFill style={{ 
                    backgroundColor: template.backgroundColor,
                    opacity: 0.5,
                    filter: `blur(${template.backgroundBlur}px)`
                }} />
            )}

            <div style={textStyle}>
                {activeSegment ? (
                    template.highlightMode === 'word' ? (
                        activeSegment.words.map((word, i) => {
                            const wordActive = currentTimeMs >= word.startMs && currentTimeMs <= word.endMs;
                            return (
                                <span 
                                    key={i} 
                                    style={{ 
                                        color: wordActive ? template.activeWordColor : template.textColor,
                                        margin: '0 8px',
                                        display: 'inline-block',
                                        transition: 'color 0.1s linear',
                                        scale: wordActive ? 1.05 : 1
                                    }}
                                >
                                    {word.text}
                                </span>
                            );
                        })
                    ) : (
                        // Line Mode
                        <span>{activeSegment.text}</span>
                    )
                ) : null}
            </div>
        </AbsoluteFill>
    );
};
