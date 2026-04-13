import { TemplateAIProvider } from './TemplateAIProvider';
import { LocalHeuristicProvider } from './LocalHeuristicProvider';
import { OpenAIProvider } from './OpenAIProvider';

export class TemplateAIProviderFactory {
    static getProvider(): TemplateAIProvider {
        const type = process.env.TEMPLATE_AI_PROVIDER || 'local';
        const apiKey = process.env.OPENAI_API_KEY;

        if (type === 'openai' && apiKey) {
            return new OpenAIProvider();
        }

        return new LocalHeuristicProvider();
    }
}
