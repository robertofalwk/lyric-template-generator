import { z } from 'zod';

// --- Base Types ---
export const WordSchema = z.object({
    text: z.string(),
    startMs: z.number().nonnegative(),
    endMs: z.number().nonnegative(),
});

export const SegmentSchema = z.object({
    id: z.string().uuid(),
    text: z.string(),
    startMs: z.number().nonnegative(),
    endMs: z.number().nonnegative(),
    words: z.array(WordSchema),
});

export const TimelineSchema = z.object({
    meta: z.object({
        version: z.string(),
        generatedAt: z.string().datetime(),
    }).optional(),
    segments: z.array(SegmentSchema),
});

// --- Template ---
export const TemplateSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().default('general'),
    ratio: z.enum(['9:16', '16:9']),
    
    // Typography
    fontFamily: z.string(),
    fontSize: z.number(),
    fontWeight: z.string().default('400'),
    lineHeight: z.number().default(1.2),
    letterSpacing: z.number().default(0),
    textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).default('none'),
    textColor: z.string(),
    activeWordColor: z.string(),
    
    // Effects
    strokeColor: z.string().default('transparent'),
    strokeWidth: z.number().default(0),
    shadow: z.boolean().default(false),
    shadowColor: z.string().default('rgba(0,0,0,0.5)'),
    shadowBlur: z.number().default(4),
    glow: z.boolean().default(false),
    glowColor: z.string().optional(),
    glowRadius: z.number().optional(),
    blur: z.boolean().default(false),
    
    // Layout
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    position: z.object({
        x: z.number().default(50), // Center X %
        y: z.number().default(50), // Center Y %
    }),
    positionY: z.number().optional(), // Top Offset % (Legacy support or explicit)
    maxTextWidth: z.number().default(80), // % of screen
    safeArea: z.boolean().default(true),
    
    // Animation
    animationIn: z.enum(['fade', 'zoom', 'slide-up', 'none']),
    animationOut: z.enum(['fade', 'zoom', 'slide-down', 'none']),
    highlightMode: z.enum(['word', 'line']),
    wordScaleActive: z.number().default(1), // Scale factor for active word
    
    // Background
    backgroundMode: z.enum(['color', 'image', 'blur', 'video', 'transparent']),
    backgroundColor: z.string().default('#000000'),
    backgroundBlur: z.number().default(0),
    backgroundOverlayColor: z.string().default('transparent'),
    backgroundOverlayOpacity: z.number().default(0),
    backgroundImagePrompt: z.string().optional(), // For future AI generation
    
    // AI Metadata
    metadata: z.object({
        sourceType: z.enum(['stock', 'ai-generated', 'ai-refined', 'manual']).default('stock'),
        originalPrompt: z.string().optional(),
        baseTemplateId: z.string().optional(),
        version: z.number().default(1),
        tags: z.array(z.string()).default([]),
    }).default({}),
});

// --- Project ---
export const ProjectSettingsSchema = z.object({
    useVocalIsolation: z.boolean().default(false),
    language: z.string().default('pt'),
    wordLevelTiming: z.boolean().default(true),
    globalOffsetMs: z.number().default(0),
});

export const ProjectSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    audioOriginalPath: z.string(),
    audioProcessedPath: z.string().optional(),
    lyricsRaw: z.string(),
    lyricsNormalized: z.string().optional(),
    selectedTemplateId: z.string(),
    aspectRatio: z.enum(['9:16', '16:9']),
    status: z.enum(['draft', 'ready', 'processing', 'completed', 'failed']),
    alignmentStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
    renderStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
    exportFormats: z.array(z.enum(['mp4', 'srt', 'ass', 'lrc'])).default(['mp4']),
    settings: ProjectSettingsSchema,
    latestTimelinePath: z.string().optional(),
    timeline: TimelineSchema.optional(), // Infused when loaded for frontend
});

// --- Jobs ---
export const RenderJobSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    type: z.enum(['alignment', 'render']).default('render'),
    status: z.enum(['queued', 'processing', 'completed', 'failed']),
    progress: z.number().min(0).max(100).default(0),
    createdAt: z.string().datetime(),
    startedAt: z.string().datetime().optional(),
    finishedAt: z.string().datetime().optional(),
    outputPath: z.string().optional(),
    logs: z.array(z.string()).default([]),
    payload: z.any().optional(), // Metadata for the job (e.g. custom template)
    errorMessage: z.string().optional(),
});

export type Word = z.infer<typeof WordSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type RenderJob = z.infer<typeof RenderJobSchema>;
export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;
