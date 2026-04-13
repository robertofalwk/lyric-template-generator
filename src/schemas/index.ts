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
    prompt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    metadata: z.record(z.any()).default({}),
    dominantColors: z.array(z.string()).default([]),
    createdAt: z.string().datetime(),
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
        x: z.number().default(50), 
        y: z.number().default(50), 
    }),
    maxTextWidth: z.number().default(80), 
    safeArea: z.boolean().default(true),
    
    // Animation
    animationIn: z.enum(['fade', 'zoom', 'slide-up', 'none']),
    animationOut: z.enum(['fade', 'zoom', 'slide-down', 'none']),
    highlightMode: z.enum(['word', 'line']),
    wordScaleActive: z.number().default(1), 
    
    // Background (Conceptual + Linked)
    backgroundMode: z.enum(['color', 'image', 'blur', 'video', 'transparent']),
    backgroundColor: z.string().default('#000000'),
    backgroundBlur: z.number().default(0),
    backgroundOverlayColor: z.string().default('transparent'),
    backgroundOverlayOpacity: z.number().default(0),
    
    // V4 Real Assets
    backgroundAssetType: z.enum(['none', 'image', 'video', 'generated']).default('none'),
    backgroundAssetId: z.string().optional(),
    backgroundPrompt: z.string().optional(),
    backgroundFit: z.enum(['cover', 'contain', 'fill']).default('cover'),
    backgroundPosition: z.string().default('center'),
    backgroundBlendMode: z.string().default('normal'),
    motionHints: z.array(z.string()).default([]),
    
    // Metadata
    metadata: z.object({
        sourceType: z.enum(['stock', 'ai-generated', 'ai-refined', 'manual']).default('stock'),
        originalPrompt: z.string().optional(),
        baseTemplateId: z.string().optional(),
        version: z.number().default(1),
        tags: z.array(z.string()).default([]),
        isFavorite: z.boolean().default(false),
        qualityScore: z.number().min(0).max(100).optional(),
    }).default({}),
});

// --- Style Packs ---
export const StylePackSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: z.string().default('general'),
    config: z.object({
        templateIds: z.array(z.string()),
        backgroundAssetIds: z.array(z.string()),
        fonts: z.array(z.string()),
        palettes: z.array(z.record(z.string())),
        intensityLevels: z.array(z.enum(['low', 'medium', 'high'])),
    }),
    isPublic: z.boolean().default(false),
    createdAt: z.string().datetime(),
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
export type StylePack = z.infer<typeof StylePackSchema>;
export type TemplateVariation = z.infer<typeof TemplateVariationSchema>;

// --- Project ---
export const ProjectSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    audioOriginalPath: z.string(),
    lyricsRaw: z.string(),
    selectedTemplateId: z.string().optional(),
    selectedBackgroundAssetId: z.string().optional(),
    selectedPackId: z.string().optional(),
    lastVisualScore: z.number().optional(),
    aspectRatio: z.enum(['9:16', '16:9']),
    status: z.enum(['draft', 'ready', 'processing', 'completed', 'failed']),
    timeline: TimelineSchema.optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const RenderJobSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    type: z.enum(['alignment', 'render']),
    status: z.enum(['queued', 'processing', 'completed', 'failed']),
    progress: z.number().default(0),
    createdAt: z.string().datetime(),
    outputPath: z.string().optional(),
    payload: z.any().optional(),
    errorMessage: z.string().optional(),
});

export type RenderJob = z.infer<typeof RenderJobSchema>;
