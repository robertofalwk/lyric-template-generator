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

// --- Background Assets ---
export const BackgroundAssetSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['image', 'video', 'gradient', 'generated-image', 'generated-video']),
    sourceType: z.enum(['uploaded', 'generated', 'stock']),
    localPath: z.string(),
    publicPath: z.string(),
    thumbnailPath: z.string().optional(),
    proxyPath: z.string().optional(),
    createdAt: z.string().datetime(),
});

// --- Template (MASTER CONTRACT V6.2) ---
export const TemplateSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().default('general'),
    ratio: z.enum(['9:16', '16:9']),
    
    // Typography (V3-V6)
    fontFamily: z.string(),
    fontSize: z.number(),
    fontWeight: z.string().default('400'),
    lineHeight: z.number().default(1.2),
    letterSpacing: z.number().default(0),
    textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).default('none'),
    textColor: z.string(),
    activeWordColor: z.string(),
    
    // Visual Effects (V4-V5)
    strokeColor: z.string().default('transparent'),
    strokeWidth: z.number().default(0),
    shadow: z.boolean().default(false),
    shadowColor: z.string().default('rgba(0,0,0,0.5)'),
    shadowBlur: z.number().default(4),
    glow: z.boolean().default(false),
    glowColor: z.string().optional(),
    glowRadius: z.number().optional(),
    blur: z.boolean().default(false),
    
    // Layout & Space (V5)
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    position: z.object({
        x: z.number().default(50), 
        y: z.number().default(50), 
    }),
    maxTextWidth: z.number().default(80), 
    safeArea: z.boolean().default(true),
    
    // Animation Controls (V4)
    animationIn: z.enum(['fade', 'zoom', 'slide-up', 'none']).default('fade'),
    animationOut: z.enum(['fade', 'zoom', 'slide-down', 'none']).default('fade'),
    highlightMode: z.enum(['word', 'line']).default('word'),
    wordScaleActive: z.number().default(1), 
    
    // Background Art Direction (V4-V6)
    backgroundMode: z.enum(['color', 'image', 'blur', 'video', 'transparent']).default('color'),
    backgroundColor: z.string().default('#000000'),
    backgroundBlur: z.number().default(0),
    backgroundOverlayColor: z.string().default('transparent'),
    backgroundOverlayOpacity: z.number().default(0),
    backgroundAssetType: z.enum(['none', 'image', 'video', 'generated']).default('none'),
    backgroundAssetId: z.string().optional(),
    backgroundPrompt: z.string().optional(),
    backgroundFit: z.enum(['cover', 'contain', 'fill']).default('cover'),
    backgroundPosition: z.string().default('center'),
    backgroundBlendMode: z.string().default('normal'),
    motionHints: z.array(z.string()).default([]),
    
    // Studio Metadata & AI Lineage (V6.2 RECONCILIATION)
    metadata: z.object({
        sourceType: z.enum(['stock', 'ai-generated', 'ai-refined', 'manual']).default('stock'),
        originalPrompt: z.string().optional(),
        refinePrompt: z.string().optional(),
        baseTemplateId: z.string().optional(),
        version: z.number().default(1),
        tags: z.array(z.string()).default([]),
        isFavorite: z.boolean().default(false),
        qualityScore: z.number().min(0).max(100).optional(),
        
        // V6 Ops & AI Lineage
        providerUsed: z.string().optional(),
        modelUsed: z.string().optional(),
        aiMode: z.enum(['external', 'local-fallback', 'local-heuristic']).optional(),
        aiRefinedAt: z.string().optional(),
        fallbackUsed: z.boolean().default(false),
        interpretationSummary: z.string().optional(),
    }).default({}),
});

// --- Project Scenes ---
export const ProjectSceneSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    name: z.string(),
    startMs: z.number(),
    endMs: z.number(),
    sectionType: z.enum(['intro', 'verse', 'pre-chorus', 'chorus', 'bridge', 'outro', 'custom']).default('verse'),
    templateId: z.string().optional(),
    backgroundAssetId: z.string().optional(),
    intensity: z.enum(['low', 'medium', 'high']).default('medium'),
    transitionIn: z.enum(['fade', 'cut', 'blur', 'zoom', 'slide']).default('fade'),
    visualScore: z.number().optional(),
    createdAt: z.string().datetime(),
});

// --- Project Feedback (V6 Ops) ---
export const ProjectCommentSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    sceneId: z.string().optional(),
    timestampMs: z.number().optional(),
    message: z.string(),
    type: z.enum(['note', 'issue', 'approval', 'warning']).default('note'),
    status: z.enum(['open', 'resolved']).default('open'),
    createdAt: z.string().datetime(),
    resolvedAt: z.string().datetime().optional(),
});

export const TemplateVariationSchema = z.object({
    id: z.string(),
    type: z.enum(['safe', 'balanced', 'bold']),
    template: TemplateSchema,
    score: z.number(),
    explanation: z.string().optional(),
});

export type Word = z.infer<typeof WordSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type BackgroundAsset = z.infer<typeof BackgroundAssetSchema>;
export type ProjectScene = z.infer<typeof ProjectSceneSchema>;
export type ProjectComment = z.infer<typeof ProjectCommentSchema>;
export type TemplateVariation = z.infer<typeof TemplateVariationSchema>;

// --- Project ---
export const ProjectSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    
    // Asset Paths
    audioOriginalPath: z.string().optional().nullable(),
    audioProcessedPath: z.string().optional().nullable(),
    latestTimelinePath: z.string().optional().nullable(),
    
    // Lyrics & Alignment
    lyricsRaw: z.string().optional().nullable(),
    lyricsNormalized: z.string().optional().nullable(),
    alignmentStatus: z.enum(['none', 'processing', 'completed', 'failed']).default('none'),
    
    // Art Direction & Visuals
    selectedTemplateId: z.string().optional().nullable(),
    selectedBackgroundAssetId: z.string().optional().nullable(),
    selectedPackId: z.string().optional().nullable(),
    lastVisualScore: z.number().optional().nullable(),
    aspectRatio: z.enum(['9:16', '16:9']),
    
    // Status & Operations
    status: z.enum(['draft', 'processing', 'review', 'approved', 'rendering', 'completed', 'published']).default('draft'),
    renderStatus: z.enum(['none', 'processing', 'completed', 'failed']).default('none'),
    
    // Configuration & Exports
    exportFormats: z.array(z.string()).default([]),
    settings: z.record(z.any()).default({}),
    
    // Data Structure
    timeline: TimelineSchema.optional().nullable(),
    scenes: z.array(ProjectSceneSchema).default([]),
});

export type Project = z.infer<typeof ProjectSchema>;

// --- Render & Alignment Jobs (V6 Ops) ---
export const RenderJobSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    type: z.enum(['alignment', 'render']),
    status: z.enum(['queued', 'processing', 'completed', 'failed']),
    progress: z.number().min(0).max(100).default(0),
    createdAt: z.string().datetime(),
    startedAt: z.string().datetime().optional().nullable(),
    finishedAt: z.string().datetime().optional().nullable(),
    outputPath: z.string().optional().nullable(),
    logs: z.array(z.string()).default([]),
    payload: z.record(z.any()).optional().nullable(),
    errorMessage: z.string().optional().nullable(),
});

export type RenderJob = z.infer<typeof RenderJobSchema>;
