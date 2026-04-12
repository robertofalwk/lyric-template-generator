# Lyric Lab (Professional Video Suite) 🎬

Plataforma industrial para geração de lyric videos sincronizados.

## 🏗️ Arquitetura
- **Web Frontend:** Next.js 14 + Tailwind CSS.
- **Service Layer:** Domain-Driven Design (DDD) com serviços isolados.
- **Database:** SQLite local (via `better-sqlite3`) para persistência robusta.
- **Worker Engine:** Processo isolado que gerencia filas de alinhamento e renderização.
- **Video Engine:** Remotion distribuído com renderização real (MP4).
- **Audio Intelligence:** Python + Stable-TS (Whisper) para sincronia perfeita.

## 🚀 Como Rodar

### 1. Pré-requisitos
- Node.js 18+
- Python 3.9+
- **FFmpeg** instalado e no PATH (necessário para Remotion e Probe).

### 2. Instalação
```bash
npm install
cd worker
pip install stable-ts
```

### 3. Configuração
Crie o seu `.env` baseado no `.env.example`.

### 4. Execução (Desenvolvimento)
Para rodar tanto o servidor web quanto o worker de processamento:
```bash
npm run dev:all
```

Ou separadamente:
```bash
npm run dev      # Web Server na porta 3000
npm run worker   # Processador de Jobs (Alinhamento e Render)
```

## 📂 Fluxo Profissional de Dados
1. **Upload:** Áudio validado via `ffprobe` (MIME, tamanho, duração).
2. **Alignment:** Criado um Job asíncrono. O `worker` dispara o script Python.
3. **Editor:** O usuário refina a timeline e o template no frontend.
4. **Preview:** Streaming seguro via rota de API (suporta seeking/range).
5. **Render:** Criado um Job de render. O `worker` faz o bundle e gera o MP4 real.

## 📦 Scripts Disponíveis
- `npm run dev:all`: Sobe tudo (Web + Worker).
- `npm run worker`: Inicia o processador de tarefas.
- `npm run typecheck`: Validação rigorosa de tipos TypeScript.
- `npm run render`: Teste de renderização manual via CLI.

## 🛡️ Segurança e Robustez
- **Sem Caminhos Absolutos:** O frontend nunca vê caminhos de arquivo do servidor.
- **Fila de Jobs:** Processamento pesado não afeta a latência da API.
- **Validação com Zod:** Fonte única de verdade para tipos e schemas.
- **Atomic Writes:** O worker Python escreve arquivos temporários para evitar corrupção.
