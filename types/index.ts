export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface Word {
    text: string;
    startMs: number;
    endMs: number;
}

export interface Segment {
    id: string;
    text: string;
    startMs: number;
    endMs: number;
    words: Word[];
}

export interface Timeline {
    segments: Segment[];
}

export interface Template {
    id: string;
    name: string;
    ratio: '9:16' | '16:9';
    // Visuals
    fontFamily: string;
    fontSize: number;
    textColor: string;
    activeWordColor: string;
    strokeColor: string;
    strokeWidth: number;
    // Layering & FX
    backgroundMode: 'color' | 'image' | 'blur' | 'video' | 'transparent';
    backgroundColor: string;
    backgroundBlur: number;
    glowColor?: string;
    glowRadius?: number;
    // Animation
    animationIn: 'fade' | 'zoom' | 'slide-up' | 'none';
    animationOut: 'fade' | 'zoom' | 'slide-down' | 'none';
    highlightMode: 'word' | 'line';
    // Layout
    positionY: number; // 0-100 (percentage from top)
    safeArea: boolean;
}

export interface ProjectSettings {
    useVocalIsolation: boolean;
    language: string;
    wordLevelTiming: boolean;
    globalOffsetMs: number;
}

export interface Project {
    id: string;
    title: string;
    audioPath: string;
    lyrics: string;
    timeline: Timeline;
    template: Template;
    settings: ProjectSettings;
    createdAt: string;
    updatedAt: string;
}

export interface ExportJob {
    id: string;
    projectId: string;
    status: JobStatus;
    progress: number;
    outputPath?: string;
    error?: string;
    createdAt: string;
    completedAt?: string;
    formats: ('mp4' | 'srt' | 'ass')[];
}
