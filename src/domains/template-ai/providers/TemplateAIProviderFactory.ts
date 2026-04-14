import { TemplateAIProvider } from './TemplateAIProvider';
import { LocalHeuristicProvider } from './LocalHeuristicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { settingsRepository } from '../../../server/repositories/SettingsRepository';

export class TemplateAIProviderFactory {
    static getProvider(): TemplateAIProvider {
        // Priority: DB Settings > Environment Variables > Default
        const dbType = settingsRepository.get('ai_provider');
        const dbKey = settingsRepository.get('openai_api_key');
        const dbModel = settingsRepository.get('openai_model');
        
        const type = dbType || process.env.TEMPLATE_AI_PROVIDER || 'local';
        const apiKey = dbKey || process.env.OPENAI_API_KEY;

        if (type === 'openai' && apiKey) {
            return new OpenAIProvider({ apiKey, model: dbModel || undefined });
        }

        return new LocalHeuristicProvider();
    }
}
