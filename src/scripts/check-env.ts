import fs from 'fs';
import path from 'path';

const REQUIRED_VARS = ['OPENAI_API_KEY', 'OPENAI_MODEL'];
const ENV_PATH = path.join(process.cwd(), '.env');

console.log('Checking Studio Environment...');

if (!fs.existsSync(ENV_PATH)) {
    console.warn('⚠ .env file not found. Create one from .env.example');
} else {
    const content = fs.readFileSync(ENV_PATH, 'utf-8');
    REQUIRED_VARS.forEach(v => {
        if (!content.includes(v)) {
            console.warn(`⚠ Missing recommended variable: ${v}`);
        }
    });
}

console.log('✔ Environment Check Complete.');
