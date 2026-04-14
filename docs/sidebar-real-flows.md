# Lyric Lab Studio - Real Operational Flows (V7)

This document describes the functional wiring between the UI and the Production Node.

## 📡 Monitor Tab
- **Project Creation:** Deploys a new signal node in the SQLite database.
- **Project Updates:** Allows updating title and lyrics for the active project.
- **Persistence:** All data is strictly validated via `ProjectSchema`.

## 🧠 Director Tab
- **Generation:** Calls OpenAI/Local provider to interpret visual strategy.
- **Refinement:** Sends prompts to refine the active template's aesthetic properties.
- **Lock Strategy:** Persists the chosen template ID to the active project.

## 🖼️ Assets Tab
- **Upload:** Real file persistence to `/public/uploads/assets`.
- **Apply:** Selecting an asset patches the project's `selectedBackgroundAssetId`.
- **Delete:** Removes metadata and cleans up the physical file from disk.

## 📚 Library Tab
- **Favorites:** Persistently marks templates as curated.
- **Duplication:** Creates a new lineage branch of an existing template.
- **Delete:** Removes custom templates from the repository.

## ⚔️ Review Tab
- **Quality Gates:** Evaluates template and project health based on technical metadata.
- **Feedback:** Fetches real project comments (notes, warnings, blockages).
- **Approval:** Locks the project status to `approved`.

## 🎬 Publish Tab
- **History:** Displays real-time status of render jobs.
- **Download:** Provides direct links to exported media files (`.mp4`, etc.).

---
*Operational Engineering - Studio Master Stage*
