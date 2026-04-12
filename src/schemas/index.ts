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
    fontFamily: z.string(),
    fontSize: z.number(),
    fontWeight: z.string().default('400'),
    textColor: z.string(),
    activeWordColor: z.string(),
    strokeColor: z.string().default('transparent'),
    strokeWidth: z.number().default(0),
    shadow: z.boolean().default(false),
    glow: z.boolean().default(false),
    blur: z.boolean().default(false),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    position: z.object({
        x: z.number().default(50),
        y: z.number().default(50),
    }),
    safeArea: z.boolean().default(true),
    animationIn: z.enum(['fade', 'zoom', 'slide-up', 'none']),
    animationOut: z.enum(['fade', 'zoom', 'slide-down', 'none']),
    highlightMode: z.enum(['word', 'line']),
    backgroundMode: z.enum(['color', 'image', 'blur', 'video', 'transparent']),
    backgroundConfig: z.record(z.any()).optional(),
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
    status: z.enum(['queued', 'processing', 'completed', 'failed']),
    progress: z.number().min(0).max(100).default(0),
    createdAt: z.string().datetime(),
    startedAt: z.string().datetime().optional(),
    finishedAt: z.string().datetime().optional(),
    outputPath: z.string().optional(),
    logs: z.array(z.string()).default([]),
    errorMessage: z.string().optional(),
});

export type Word = z.infer<typeof WordSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type RenderJob = z.infer<typeof RenderJobSchema>;
export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;
