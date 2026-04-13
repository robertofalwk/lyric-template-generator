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

// --- Ops: Comments (V6) ---
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

// --- Ops: Project Events (V6) ---
export const ProjectEventSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    type: z.string(), // created, aligned, approved, etc
    payload: z.any().optional(),
    createdAt: z.string().datetime(),
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
    backgroundColor: z.string().default('#000000'),
    backgroundOverlayOpacity: z.number().default(0),
    backgroundAssetId: z.string().optional(),
    metadata: z.object({
        version: z.number().default(1),
        qualityScore: z.number().min(0).max(100).optional(),
        sourceType: z.enum(['stock', 'ai-generated', 'ai-refined', 'manual']).default('stock'),
    }).default({}),
});

// --- Ops: Render Snapshot (V6) ---
export const RenderHistorySchema = z.object({
    id: z.string(),
    projectId: z.string(),
    jobId: z.string().optional(),
    presetId: z.string().optional(),
    snapshot: z.string(), // JSON string of (Template + Scenes + Assets)
    outputPath: z.string().optional(),
    posterPath: z.string().optional(),
    status: z.string(),
    createdAt: z.string().datetime(),
});

export type Template = z.infer<typeof TemplateSchema>;
export type ProjectScene = z.infer<typeof ProjectSceneSchema>;
export type ProjectComment = z.infer<typeof ProjectCommentSchema>;
export type ProjectEvent = z.infer<typeof ProjectEventSchema>;
export type RenderHistory = z.infer<typeof RenderHistorySchema>;

// --- Project ---
export const ProjectSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    selectedTemplateId: z.string().optional(),
    lastVisualScore: z.number().optional(),
    aspectRatio: z.enum(['9:16', '16:9']),
    status: z.enum(['draft', 'review', 'approved', 'rendering', 'completed', 'published']).default('draft'),
    timeline: TimelineSchema.optional(),
    scenes: z.array(ProjectSceneSchema).default([]),
    comments: z.array(ProjectCommentSchema).default([]), // V6
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
});

export type RenderJob = z.infer<typeof RenderJobSchema>;
