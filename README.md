# Lyric Template Generator (v2 Robust Refactor) 🎬

Ambiente de produção local para geração automática de lyrics de alta fidelidade.

## O que há de novo na v2:
- **Storage Privado:** Uploads e projetos agora ficam em `/storage`, fora do cache público.
- **Pipeline de Áudio:** Suporte a Isolamento Vocal (Demucs) e alinhamento via Stable-TS.
- **Render Worker:** Exportação assíncrona com fila de jobs local (Queue).
- **Editor Manual:** Interface para ajuste fino de offsets e edição de texto sincronizado.
- **Templates Pro:** 5 templates configuráveis via JSON com suporte a blur, stroke e glow.
- **Formatos:** Exportação de MP4 (H.264), SRT e ASS.

## Requisitos de Sistema
- **Node.js:** 18+
- **Python:** 3.9+ (com GPU recomendada para Demucs)
- **FFmpeg:** Obrigatório no PATH do sistema.

## Instalação e Setup

### 1. Backend e Remotion
```bash
npm install
```

### 2. Ambiente de Processamento (Python)
```bash
cd worker
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Rodar a Aplicação
```bash
npm run dev
```

## Arquitetura de Pipeline
1. **Upload:** O áudio é validado e salvo em `storage/projects/{id}/audio.mp3`.
2. **Alignment:** O worker Python processa o áudio (com isolamento opcional) e gera `timeline.json`.
3. **Drafting:** O usuário ajusta o template e timings no editor visual.
4. **Export:** Um Job é criado na fila. O renderizador Remotion processa o vídeo no background.
5. **Finalize:** O vídeo é movido para `public/exports` e legendas SRT são geradas no storage.

## Configuração de Templates
Edite `config/templates.ts` para criar seus próprios estilos. Suporta:
- `highlightMode`: 'word' (karaoke) ou 'line' (tradicional).
- `backgroundMode`: blur, color ou transparent.
- `animationIn/Out`: zoom, fade, slide.

## Troubleshooting
- **FFmpeg não encontrado:** Certifique-se de que `ffmpeg -version` funciona no seu shell.
- **Python Error:** Verifique se as dependências do `requirements.txt` estão instaladas no venv ativo.
- **Render Lento:** A renderização de vídeo consome CPU/GPU intensamente.
