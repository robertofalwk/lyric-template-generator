import { TemplateAIProvider } from './TemplateAIProvider';
import { LocalHeuristicProvider } from './LocalHeuristicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { settingsRepository } from '../../../server/repositories/SettingsRepository';

export class TemplateAIProviderFactory {
    static getProvider(): TemplateAIProvider {
        const dbType = settingsRepository.get('ai_provider');
        const dbKey = settingsRepository.get('openai_api_key');
        const dbModel = settingsRepository.get('openai_model');
        
        const type = dbType || process.env.TEMPLATE_AI_PROVIDER || 'local';
        const apiKey = dbKey || process.env.OPENAI_API_KEY;

        console.log(`[TemplateAIProviderFactory] Resolved Provider: ${type} (Has Key: ${!!apiKey})`);

        if (type === 'openai') {
            if (!apiKey) {
                console.error('[TemplateAIProviderFactory] OpenAI selected but API Key is missing.');
                // We throw here only if we WANT to force the user to provide a key
                // Alternatively, we return a "BrokenProvider" or just Local but log it.
                // The user requested to "remover ou reduzir fallback silencioso".
                throw new Error('OpenAI Provider selected but API Key is missing in settings.');
            }
            return new OpenAIProvider({ apiKey, model: dbModel || undefined });
        }

        return new LocalHeuristicProvider();
    }
}
