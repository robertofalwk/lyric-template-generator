import React from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { Timeline, Template } from '@/src/schemas';

interface LyricVideoProps {
    audioSrc: string;
    timeline: Timeline;
    template: Template;
}

export const LyricVideo: React.FC<LyricVideoProps> = ({ audioSrc, timeline, template }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;

    // Find active segment
    const activeSegment = timeline.segments.find(
        (s) => currentTimeMs >= s.startMs && currentTimeMs <= s.endMs
    );

    return (
        <AbsoluteFill style={{ 
            backgroundColor: template.backgroundMode === 'color' ? template.backgroundColor : 'transparent',
            display: 'flex',
            alignItems: template.alignment === 'center' ? 'center' : template.alignment === 'left' ? 'flex-start' : 'flex-end',
            justifyContent: 'center',
            padding: template.safeArea ? '10%' : '5%',
        }}>
            {audioSrc && <Audio src={audioSrc} />}

            {/* Background Effects (Mocked image/video for now) */}
            {template.backgroundMode === 'blur' && (
                <AbsoluteFill style={{ 
                    filter: `blur(${template.backgroundBlur}px)`, 
                    backgroundColor: template.backgroundColor,
                    opacity: 0.8
                }} />
            )}

            {activeSegment && (
                <div style={{
                    position: 'absolute',
                    top: `${template.positionY || template.position.y}%`,
                    left: `${template.position.x}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    textAlign: template.alignment as any,
                    color: template.textColor,
                    fontFamily: template.fontFamily,
                    fontSize: template.fontSize,
                    fontWeight: template.fontWeight,
                    textShadow: template.glow 
                        ? `0 0 ${template.glowRadius}px ${template.glowColor || template.textColor}` 
                        : 'none',
                    WebkitTextStroke: `${template.strokeWidth}px ${template.strokeColor}`,
                }}>
                    {template.highlightMode === 'word' ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: template.alignment === 'center' ? 'center' : 'flex-start' }}>
                            {activeSegment.words.map((word, i) => {
                                const isActive = currentTimeMs >= word.startMs && currentTimeMs <= word.endMs;
                                
                                // Entrance animation
                                const opacity = interpolate(
                                    frame - (activeSegment.startMs / 1000 * fps),
                                    [0, 10],
                                    [0, 1],
                                    { extrapolateRight: 'clamp' }
                                );

                                return (
                                    <span key={i} style={{ 
                                        marginRight: '0.25em',
                                        color: isActive ? template.activeWordColor : template.textColor,
                                        opacity,
                                        transition: 'color 0.1s ease',
                                        display: 'inline-block'
                                    }}>
                                        {word.text}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ transition: 'all 0.3s ease' }}>
                            {activeSegment.text}
                        </div>
                    )}
                </div>
            )}
        </AbsoluteFill>
    );
};
