import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('--- Lyric Lab V7 Health Audit ---');

const checkBinary = (name: string, cmd: string) => {
    try {
        const ver = execSync(cmd).toString().split('\n')[0];
        console.log(`✔ ${name} detected: ${ver}`);
        return true;
    } catch (e) {
        console.warn(`✖ ${name} NOT FOUND.`);
        return false;
    }
};

const binaries = [
    { name: 'Node.js', cmd: 'node -v' },
    { name: 'NPM', cmd: 'npm -v' },
    { name: 'Python', cmd: 'python --version' },
    { name: 'FFmpeg', cmd: 'ffmpeg -version' },
    { name: 'Git', cmd: 'git --version' }
];

let allOk = true;
binaries.forEach(b => { if (!checkBinary(b.name, b.cmd)) allOk = false; });

const storageCheck = () => {
    const folders = ['storage', 'public/uploads', 'public/exports'];
    folders.forEach(f => {
        const p = path.join(process.cwd(), f);
        if (fs.existsSync(p)) console.log(`✔ Folder exists: ${f}`);
        else { console.warn(`✖ Folder MISSING: ${f}`); allOk = false; }
    });
};

storageCheck();

if (allOk) console.log('\n--- Status: READY FOR PRODUCTION ---');
else console.log('\n--- Status: DEGRADED (Check missing binaries) ---');
