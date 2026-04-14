# Audio Ingestion Debug Plan

## 1. Expected Flow vs. Real Flow

### Expected Flow (The Happy Path)
1. **User Action**: Create project (Dashboard -> HandleCreateProject).
2. **System Action**: Project saved in SQLite.
3. **User Action**: File selection triggers (Audio selector).
4. **API Call**: `POST /api/projects/{id}/upload-audio`.
   - Result: Audio saved in `storage/projects/{id}/audio_source.mp3`.
   - Database: `audioOriginalPath` updated.
5. **API Call**: `POST /api/projects/{id}/align`.
   - Result: Job type `alignment` created in `RenderJobs`.
   - Database: Project status set to `processing`.
6. **Worker Action**: Polls for `queued` alignment job.
   - Action: Mark as `processing`.
   - Sub-action: Spawn `python worker/aligner.py`.
   - Result: `timeline.json` generated.
   - Action: Update project with `timeline` and status `ready`.
   - Action: Mark job as `completed`.
7. **UI Action**: Polling detects status change or timeline presence.
8. **UI Action**: Rehydration. Player becomes visible.

### Real Flow Found (The Bug)
- **Step 1-6**: Seem theoretically correct in code.
- **Step 7**: **MISSING**. Dashboard (`app/page.tsx`) does not poll the project or the job.
- **Result**: Even if the backend finishes in 5 seconds, the UI stays in `Awaiting Signal Ingestion` because it's looking at a "stale" `project` object in React state.

---

## 2. Potential Points of Failure (Phase 3 Targets)

| Point | Risk | Investigation Method |
| :--- | :--- | :--- |
| **Frontend Polling** | High | Audit `app/page.tsx` for `setInterval` or `setTimeout` re-fetches. (Verified: Missing). |
| **Python Instance** | Medium | Check if `python` is in PATH and if `worker/aligner.py` can run manually. |
| **FFmpeg/FFprobe** | Medium | Check if `ffprobe` succeeds in `upload-audio` route. |
| **Worker Connectivity** | Medium | Verify if `tsx watch src/server/worker.ts` is actually running and connected to the same DB. |
| **Database Locking** | Low | Check if SQLite is being locked by the dev server or worker. |

---

## 3. Debugging Steps (Reproducing & Verifying)

1. **Terminal 1**: Start `npm run dev` (API + Web).
2. **Terminal 2**: Start `npm run worker` (Worker queue).
3. **Manual Check**: 
   - [ ] Check `ls storage/projects/{id}/` after upload.
   - [ ] Check SQLite data: `SELECT alignmentStatus, status FROM projects WHERE id='...'`.
   - [ ] Check `RenderJobs` table for the alignment job.
4. **Logs Oversight**:
   - Look for `[Worker Error]` in the worker terminal.
   - Look for `[Alignment] Spawning: python ...` in the worker terminal.

## 4. Proposed Fixes

1. **UI Polling**: Implement a `useProjectSync` hook or a `useEffect` that polls the active project status when it is in `processing` or `queued`.
2. **Status Mapping**: Map `alignmentStatus === 'processing'` to a specific "Processing Studio Signal..." loading bar in the UI, rather than a generic "Awaiting" message.
3. **Error Feedback**: If `project.status === 'failed'`, show the error message from the project or last job.

---

## 5. Success Criteria
- [ ] User uploads audio.
- [ ] Dashboard shows "Processing Audio..." transition.
- [ ] Dashboard automatically transitions to the Player once the timeline is ready (without page refresh).
