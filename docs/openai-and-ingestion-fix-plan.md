# OpenAI and Ingestion Fix Plan

## 1. Current State of OpenAI Configuration
- **Mechanism**: Hardcoded reliance on `process.env.OPENAI_API_KEY` and `TEMPLATE_AI_PROVIDER`.
- **Limitation**: Users cannot change the key or switch providers without restarting the server and manually editing files. This is a barrier for SaaS-readiness and local flexibility.
- **Factory**: `TemplateAIProviderFactory` is synchronous and static, making it hard to inject dynamic runtime settings.

## 2. Audio Ingestion & Alignment Issues
- **Polling**: Previous iterations lacked a central "Rehydration" loop that automatically checked for job completion across different dashboard sessions.
- **State Blocking**: The Sidebar locks almost all creative menus (`Director`, `Library`, `Review`) until a `timeline` is present. This is too aggressive; some parts of the `Library` should be accessible to browse templates even without audio.
- **Feedback**: Errors during alignment often result in an "Infinite Loading" state because the frontend doesn't re-poll the failure state from the DB.

---

## 3. The Sprint Strategy

### Phase 2: Dynamic Settings Persistence
1. **DB Schema**: Add a `system_settings` table to SQLite (Key-Value pairs).
2. **Repository**: Create `SettingsRepository` to fetch/update keys like `openai_api_key`, `ai_provider`, and `openai_model`.
3. **API**: Create `app/api/settings/route.ts` (GET/POST) to manage these with basic security (masking keys in GET).
4. **UI**: Update the Dashboard's "Settings" view to include a "Studio AI Configuration" panel.

### Phase 3-5: Progressive Unlocking & Robust Polling
1. **Sidebar Refactor**: Change lock logic. Instead of `!timeline`, use `!currentProject` for Library, and `!timeline` only for Director sections that require segment mapping.
2. **Dashboard Logic**: Refine the polling interval to stop properly on `failed` states and show the `project.errorMessage`.
3. **Messages**: Explicit transitions like: "Signal Processed. Select a Style" instead of "Awaiting Signal".

---

## 4. Expected Outcomes
- Total flexibility to use Local (Heuristic) or OpenAI providers.
- No more manual `.env` editing for the end user.
- A studio that feels "alive" and reactive to background work.
