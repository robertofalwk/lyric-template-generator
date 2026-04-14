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
        if (motion.preset === 'push_in') {
            const scale = interpolate(currentTimeMs, [activeScene?.startMs || 0, activeScene?.endMs || 10000], [1, 1.2 * motion.intensity]);
            return { transform: `scale(${scale})` };
        }
        if (motion.preset === 'micro_shake') {
            const x = Math.sin(frame * 0.5) * 2 * motion.intensity;
            const y = Math.cos(frame * 0.4) * 2 * motion.intensity;
            return { transform: `translate(${x}px, ${y}px)` };
        }
        if (motion.preset === 'parallax') {
            const x = Math.sin(frame * 0.1) * 20 * motion.intensity;
            return { transform: `translateX(${x}px)` };
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
        const activeIdx = timeline.segments.findIndex(s => currentTimeMs >= s.startMs && currentTimeMs <= s.endMs);
        const scrollY = interpolate(activeIdx, [0, timeline.segments.length], [0, -timeline.segments.length * 40]);
        
        return (
            <div style={{ transform: `translateY(${scrollY}px)`, transition: 'transform 0.5s ease' }}>
                {timeline.segments.map((seg, i) => {
                    const isActive = i === activeIdx;
                    return (
                        <div key={i} style={{ 
                            opacity: isActive ? 1 : 0.3,
                            fontSize: isActive ? '1.2em' : '1em',
                            transition: 'all 0.5s ease',
                            margin: '10px 0'
                        }}>
                            {seg.text}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (behavior.mode === 'karaoke_bar') {
        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ opacity: 0.3, color: template.textColor }}>
                    {segment.text}
                </div>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    color: template.activeWordColor,
                    width: (() => {
                        const words = segment.words;
                        if (!words || words.length === 0) return '0%';
                        if (currentTimeMs >= segment.endMs) return '100%';
                        if (currentTimeMs <= segment.startMs) return '0%';

                        // Find current word
                        let currentWordIdx = words.findIndex(w => currentTimeMs >= w.startMs && currentTimeMs <= w.endMs);
                        if (currentWordIdx === -1) {
                            // Find the last word that ended
                            for (let i = words.length - 1; i >= 0; i--) {
                                if (currentTimeMs > words[i].endMs) {
                                    return `${((i + 1) / words.length) * 100}%`;
                                }
                            }
                            return '0%';
                        }

                        const currentWord = words[currentWordIdx];
                        const wordProgress = Math.max(0, Math.min(1, (currentTimeMs - currentWord.startMs) / (currentWord.endMs - currentWord.startMs)));
                        const basePercentage = (currentWordIdx / words.length) * 100;
                        const additionalPercentage = (wordProgress / words.length) * 100;
                        return `${basePercentage + additionalPercentage}%`;
                    })()
                }}>
                    {segment.text}
                </div>
            </div>
        );
    }

    if (behavior.mode === 'cinematic_blocks') {
        const chars = segment.text.split('');
        const duration = segment.endMs - segment.startMs;
        const progress = Math.max(0, Math.min(1, (currentTimeMs - segment.startMs) / duration));
        const visibleChars = Math.floor(progress * chars.length);

        return (
            <div style={{ 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                display: 'inline-block',
                color: template.textColor 
            }}>
                {chars.slice(0, visibleChars).join('')}
            </div>
        );
    }

    return <div>{segment.text}</div>;
};
