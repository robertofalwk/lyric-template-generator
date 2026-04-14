import fs from 'fs/promises';

const baseUrl = 'http://localhost:3000';

async function assertOk(response: Response, label: string) {
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`${label} failed (${response.status}): ${body}`);
    }
}

async function sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
    console.log('--- TEMPLATE LIBRARY FLOW VALIDATION ---');

    const templatesRes = await fetch(`${baseUrl}/api/templates`);
    await assertOk(templatesRes, 'Initial template listing');
    const templates = await templatesRes.json();
    console.log(`Templates available: ${templates.length}`);
    if (!Array.isArray(templates) || templates.length === 0) {
        throw new Error('Template library is empty');
    }

    const createdAt = new Date().toISOString();
    const createProjectRes = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: `Validation ${createdAt}`,
            lyrics: 'hello world this is a quick validation timeline'
        }),
    });
    await assertOk(createProjectRes, 'Project creation');
    const project = await createProjectRes.json();
    console.log(`Project created: ${project.id}`);

    const audioBuffer = await fs.readFile('storage/test-tone.wav');
    const uploadForm = new FormData();
    uploadForm.append('audio', new File([audioBuffer], 'test-tone.wav', { type: 'audio/wav' }));
    const uploadRes = await fetch(`${baseUrl}/api/projects/${project.id}/upload-audio`, {
        method: 'POST',
        body: uploadForm,
    });
    await assertOk(uploadRes, 'Audio upload');
    console.log('Audio uploaded.');

    const alignRes = await fetch(`${baseUrl}/api/projects/${project.id}/align`, { method: 'POST' });
    await assertOk(alignRes, 'Alignment request');
    const alignJob = await alignRes.json();
    console.log(`Alignment job queued: ${alignJob.id}`);

    let latestProject = project;
    for (let i = 0; i < 40; i++) {
        await sleep(2000);
        const projectRes = await fetch(`${baseUrl}/api/projects/${project.id}`);
        await assertOk(projectRes, 'Project polling');
        latestProject = await projectRes.json();
        if (
            latestProject.alignmentStatus === 'completed' ||
            latestProject.alignmentStatus === 'failed'
        ) {
            break;
        }
    }

    console.log(`Alignment status: ${latestProject.alignmentStatus}`);
    console.log(`Project status: ${latestProject.status}`);

    const sampleTemplate = templates[0];
    const templateByIdRes = await fetch(`${baseUrl}/api/templates/${sampleTemplate.id}`);
    await assertOk(templateByIdRes, 'Template resolve by ID');
    const resolvedTemplate = await templateByIdRes.json();
    console.log(`Template resolved by id: ${resolvedTemplate.id}`);

    const selectTemplateRes = await fetch(`${baseUrl}/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedTemplateId: resolvedTemplate.id }),
    });
    await assertOk(selectTemplateRes, 'Template selection persist');
    const updatedProject = await selectTemplateRes.json();
    console.log(`selectedTemplateId persisted: ${updatedProject.selectedTemplateId}`);

    const previewUnlocked =
        Boolean(updatedProject.selectedTemplateId) &&
        updatedProject.alignmentStatus === 'completed';
    console.log(`Preview unlocked condition: ${previewUnlocked ? 'YES' : 'NO'}`);
}

run().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
