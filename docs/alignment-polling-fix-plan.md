# Alignment Polling Fix Plan

## 1. Expected vs. Real Flow

### Expected (The "Closed Cycle")
1. **Trigger**: `POST /align` creates a job and sets project to `processing`.
2. **Monitoring**: Frontend polls the Job AND the Project status.
3. **Transition**: When job is `completed`, frontend fetches the final project object (which now has `timeline`).
4. **Hydration**: React state updates `project` and `timeline`.
5. **Guidance**: UI transitions from "Aligning" to "Ready" or "Select Template".

### Real (Current Findings)
- **Polling Lacuna**: Previous versions of `app/page.tsx` lacked any `setInterval` mechanism, depending solely on the user's manual refresh or the single response from the `align` call.
- **Preview Blockage**: The logic `project && timeline && activeTemplate` is an "All-or-Nothing" gate. If the alignment is done but the user hasn't picked a template, the screen remains trapped in a generic "Awaiting" message.
- **Worker Silence**: The worker updates the DB, but without polling, the frontend remains "stale".

---

## 2. Technical Implementation strategy

### Phase 2: Dual Polling Logic
- **Project Polling**: Every 3-5 seconds, fetch `/api/projects/${id}`. This is the source of truth for the `timeline`.
- **Job Polling**: Fetch `/api/projects/${id}/jobs` to show real logs/progress if the job is active.

### Phase 3 & 4: Granular UI Feedbacks
Update the dashboard preview area to handle these refined states:
- **Project Processing**: Show "Studio Aligner Working - Synchronizing Signal..."
- **Job Completed BUT no Template**: Show "Audio Processed. Pick a visualization style."
- **Job Failed**: Show the `errorMessage` from the project/job.

---

## 3. Rehydration & Hardening
- **Stop Condition**: Clear interval as soon as `project.alignmentStatus !== 'processing'`.
- **Cleanup**: Ensure `useEffect` returns a cleanup function to prevent memory leaks and zombie fetches.
- **Initial Sync**: When clicking on a project from the Hub, immediately check the status to resume polling if it was left in `processing`.
