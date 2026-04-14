# OpenAI and Alignment Stage Review

## 1. Diagnostics: OpenAI Configuration
- **The .env Trap**: Providers are hardcoded to `process.env` in their constructors, making the `system_settings` database table ineffective after instantiation if they aren't destroyed/recreated or if the constructor isn't updated.
- **Provider Factory**: The current `TemplateAIProviderFactory.getProvider()` fetches from DB, but the `OpenAIProvider` ignores those values.
- **Connection Test Sabotage**: The current test uses `refineTemplate`, which runs `TemplateSchema.parse()`. Since the test passes a "dummy" or partial template, Zod throws a validation error (expected string at id, etc.), giving a false-negative "failure" message.

## 2. Diagnostics: Alignment Cycle
- **Status Infinity**: The UI depends on a single state variable. If the fetch fails or if the polling doesn't account for `failed` states explicitly, the loader spins forever.
- **Settings Fragility**: `AlignmentService` passes `settings.language` to Python. If `project.settings` is an empty object `{}` (default), this results in `undefined` being passed as a command-line argument.
- **System Health**: Health checks for Python dependencies (`stable-ts`) are surface-level and don't verify if they are actually callable in the worker's context.

---

## 3. The Fix Strategy

### Phase 2: OpenAI Persistence Logic
- Update `OpenAIProvider` constructor to accept optional configuration.
- Update `TemplateAIProviderFactory` to inject DB settings into the provider instance.

### Phase 3: Dedicated Test Route
- Create `POST /api/settings/test-studio-ai`.
- Logic: `getProvider()` -> `generateIntent("Verify connection")` -> Return Success. Avoid template-level validation.

### Phase 4: Alignment Hardening
- Implement `DEFAULT_PROJECT_SETTINGS` in `ProjectSchema`.
- Merge incoming project settings with defaults in `AlignmentService`.

### Phase 5: UI/UX Polling & States
- Explicitly handle `failed` alignment with an error message in the dashboard.
- Stop polling immediately on terminal states (`completed`, `failed`).
