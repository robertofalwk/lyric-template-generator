# Upload Audio Unblock Plan

## 1. Expected Flux vs. Real Findings

### Expected Flux
1. **Creation**: Dashboard initiates project.
2. **Upload**: User selects audio -> `POST /api/projects/{id}/upload-audio`.
3. **Validation**: `ffprobe` validates format and duration.
4. **Initiation**: `POST /api/projects/{id}/align` creates a background job.
5. **Processing**: Worker (Python/Stable-TS) processes audio.
6. **Delivery**: Project status changes to `ready`, `timeline` is filled.
7. **Unlock**: UI shows "Ready for Preview" and allows template selection.

### Real Breakdown (The "Empty Shell" Problem)
- **Silent Failures**: The `handleFileUpload` in `app/page.tsx` had a `catch (error) {}` block that effectively silenced any API errors (like 404, 400, or 500).
- **Environment Blockers**: Missing `stable-ts` library and `ffprobe` availability can stop the chain at step 3 or 5, but the UI stayed in a generic loading state.
- **State Deadlock**: The preview component had a rigid condition: `project && timeline && activeTemplate`. If any was missing, it showed generic "Awaiting Signal Ingestion" without explaining *why* (Is it uploading? Is it aligning? Did it fail? Is a template missing?).
- **Polling Lacuna**: The frontend did not periodically check for job status updates once process started.

---

## 2. Hardening Strategy

### Phase 2 & 3: Error Transparency
- Update `handleFileUpload` to use `alert` or `setStatusMsg` for ANY non-ok response.
- Ensure `upload-audio` route returns specific error codes for "FFmpeg Not Found" vs "Invalid File".

### Phase 4: Dynamic UI States
Replacing the generic Loader with a state-aware view:
- **`draft` (no audio)**: "Ready for Signal. Attach Audio."
- **`processing` (alignment)**: "Studio Aligner Working - Synchronizing Narrative..."
- **`failed`**: "Signal Ingestion Failed. [Details]"
- **`ready` (but no template)**: "Audio Processed. Select a Visualization Template."

### Phase 5 & 6: Cycle Closure
- **Rehydration**: Ensure that once `timeline` exists in the polled project object, the UI automatically transitions.
- **Guidance**: Use labels in the Sidebar to indicate what is missing (e.g., "Library locked until audio ingestion").

---

## 3. Critical Dependencies
- **System**: `python`, `ffmpeg`, `ffprobe`.
- **Python Package**: `stable-ts` (Aligner).
- **Database**: `storage/database.sqlite` (Table: `render_jobs`).
