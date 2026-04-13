# 🎬 Lyric Lab V7 - Studio Master

Lyric Lab is a professional-grade audiovisual production platform designed to generate high-fidelity lyric videos using AI-driven art direction and scene-based synchronization.

## 🚀 Quick Start (Production Setup)

### 1. Requirements
- **Node.js**: v18+ 
- **FFmpeg**: Must be in PATH (Required for video rendering)
- **Python 3.10+**: (Required for audio alignment)
- **OpenAI API Key**: (Required for AI Art Direction)

### 2. Installation
```powershell
# Clone and enter
git clone 
cd lyric-template-generator

# Full Studio Bootstrap
npm run setup
```

### 3. Environment Config
Rename `.env.example` to `.env` and fill in your keys:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

### 4. Running the Studio
```powershell
# Launch both Web UI + Worker
npm run dev:all
```

## 🛠 Operational Workflow
1. **Workspace Hub**: Create or open a project.
2. **Signal Ingestion**: Upload audio to trigger auto-alignment.
3. **Art Direction**: Use the **Director** console to generate or refine visual intents via OpenAI.
4. **Scene Production**: Fine-tune specific time-segments (Intro, Verse, Chorus).
5. **Review**: Pass quality gates (Contrast, Safe-zones).
6. **Publish**: Render and export the final MP4.

## 📡 Diagnostic Nodes
Access the **Settings** tab in the dashboard to monitor:
- **Database**: SQLite node status.
- **Worker**: Render queue health.
- **Binaries**: FFmpeg and Python detection.
- **Intelligence**: OpenAI connectivity.

## 🏗 Architecture
- **Frontend**: Next.js 16 + Tailwind CSS + Lucide.
- **Rendering**: Remotion (Frame-by-frame master).
- **IA**: OpenAI GPT-4o (Intent Interpretation).
- **Persistence**: Better-SQLite3.
- **Worker**: Specialized background process for alignment and rendering.

---
*Developed for professional studio distribution.*
