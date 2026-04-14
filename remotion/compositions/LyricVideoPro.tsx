import React from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, Series, interpolate, spring } from 'remotion';
import { Timeline, Template, ProjectScene } from '@/src/schemas';

interface LyricVideoProProps {
    audioSrc: string;
    timeline: Timeline;
    globalTemplate: Template;
    scenes: (ProjectScene & { assetUrl?: string; template?: Template })[];
    fps: number;
}

export const LyricVideoPro: React.FC<LyricVideoProProps> = ({ 
    audioSrc, 
    timeline, 
    globalTemplate, 
    scenes = [] 
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;

    // 1. Scene Orchestration
    const activeScene = scenes.find(s => currentTimeMs >= s.startMs && currentTimeMs <= s.endMs) || scenes[0];
    const activeTemplate = activeScene?.template || globalTemplate;

    // 2. Camera Motion Calculation
    const getCameraStyle = () => {
        const motion = activeTemplate.cameraMotion || { preset: 'none', intensity: 1 };
        if (motion.preset === 'zoom_drift') {
            const scale = interpolate(frame, [0, 1000], [1, 1 + (0.1 * motion.intensity)]);
            return { transform: `scale(${scale})` };
        }
        if (motion.preset === 'micro_shake') {
            const x = Math.sin(frame * 0.5) * 2 * motion.intensity;
            const y = Math.cos(frame * 0.4) * 2 * motion.intensity;
            return { transform: `translate(${x}px, ${y}px)` };
        }
        return {};
    };

    return (
        <AbsoluteFill style={{ backgroundColor: activeTemplate.backgroundColor }}>
            {audioSrc && <Audio src={audioSrc} />}

            {/* Background Layer with Scene Transitions */}
            <AbsoluteFill style={{ ...getCameraStyle() }}>
                {scenes.map((scene, i) => {
                    const isVisible = currentTimeMs >= scene.startMs && currentTimeMs <= scene.endMs;
                    if (!isVisible) return null;

                    return (
                        <AbsoluteFill key={scene.id}>
                            {scene.assetUrl ? (
                                <img 
                                    src={scene.assetUrl} 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: activeTemplate.backgroundFit as any,
                                        opacity: scene.intensity === 'high' ? 1 : 0.7
                                    }} 
                                    alt="Background"
                                />
                            ) : (
                                <div style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    backgroundColor: activeTemplate.backgroundColor 
                                }} />
                            )}
                            {/* Overlay per scene */}
                            <AbsoluteFill style={{ 
                                backgroundColor: activeTemplate.backgroundOverlayColor || 'black',
                                opacity: activeTemplate.backgroundOverlayOpacity || 0.3
                            }} />
                        </AbsoluteFill>
                    );
                })}
            </AbsoluteFill>

            {/* Typography Engine Pro */}
            <AbsoluteFill style={{ 
                padding: '10%',
                display: 'flex',
                alignItems: activeTemplate.alignment === 'center' ? 'center' : 'flex-end',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: '100%',
                    textAlign: activeTemplate.alignment as any,
                    fontFamily: activeTemplate.fontFamily,
                    fontSize: activeTemplate.fontSize,
                    color: activeTemplate.textColor,
                    fontWeight: activeTemplate.fontWeight,
                    textTransform: activeTemplate.textTransform,
                    lineHeight: activeTemplate.lineHeight,
                }}>
                    <TypographyEngine 
                        currentTimeMs={currentTimeMs} 
                        timeline={timeline} 
                        template={activeTemplate}
                        fps={fps}
                        frame={frame}
                    />
                </div>
            </AbsoluteFill>

            {/* Post-Processing Layer (V7) */}
            <AbsoluteFill style={{ pointerEvents: 'none' }}>
                {activeTemplate.visualFx?.vignette && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)',
                    }} />
                )}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

const TypographyEngine: React.FC<{
    currentTimeMs: number;
    timeline: Timeline;
    template: Template;
    fps: number;
    frame: number;
}> = ({ currentTimeMs, timeline, template, fps, frame }) => {
    const behavior = template.textBehavior || { mode: 'word_by_word' };

    // Find active segment
    const segment = timeline.segments.find(s => currentTimeMs >= s.startMs && currentTimeMs <= s.endMs);
    if (!segment) return null;

    if (behavior.mode === 'word_by_word') {
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: template.alignment === 'center' ? 'center' : 'flex-start' }}>
                {segment.words.map((word, i) => {
                    const isActive = currentTimeMs >= word.startMs && currentTimeMs <= word.endMs;
                    
                    const s = spring({
                        frame: frame - (word.startMs / 1000 * fps),
                        fps,
                        config: { stiffness: 100 }
                    });

                    return (
                        <span key={i} style={{
                            marginRight: '0.25em',
                            display: 'inline-block',
                            color: isActive ? template.activeWordColor : template.textColor,
                            transform: `scale(${isActive ? template.wordScaleActive : interpolate(s, [0, 1], [0.8, 1])})`,
                            opacity: interpolate(s, [0, 1], [0, 1]),
                            filter: isActive && template.visualFx?.wordGlow ? `drop-shadow(0 0 10px ${template.activeWordColor})` : 'none',
                            textShadow: isActive && template.visualFx?.wordPulse ? `0 0 ${10 + Math.sin(frame * 0.2) * 5}px ${template.activeWordColor}` : 'none'
                        }}>
                            {word.text}
                        </span>
                    );
                })}
            </div>
        );
    }

    if (behavior.mode === 'rolling_lines') {
        // Implementation of rolling lines would go here
        return <div>{segment.text}</div>;
    }

    return <div>{segment.text}</div>;
};
