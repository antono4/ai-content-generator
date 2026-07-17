# AetherOS Quick Start

## Running the Application

### Development Mode

1. **Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

2. **Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

3. Open http://localhost:3000 in your browser

### Docker Mode

```bash
docker-compose up
```

### Production Build

```bash
cd frontend && npm run build
cd ../backend && npm start
```

## Project Structure

```
aetheros/
├── frontend/           # React + Three.js frontend
│   ├── src/
│   │   ├── core/      # Spatial engine, nodes, physics
│   │   ├── components/# React components
│   │   └── stores/    # Zustand state management
│   └── public/        # Static assets
│
├── backend/           # Node.js backend
│   └── src/
│       ├── routes/    # API endpoints
│       ├── services/  # AI kernel, generator, knowledge graph
│       └── middleware/# Error handling
│
├── docs/              # Architecture documentation
└── docker-compose.yml # Container orchestration
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `OPENAI_API_KEY` - For GPT-4 integration
- `GEMINI_API_KEY` - For Gemini Pro
- `ANTHROPIC_API_KEY` - For Claude
- `LOCAL_MODEL_URL` - For Ollama/local models

## Key Features

1. **3D Spatial Environment** - Interactive WebGL scene with particles and physics
2. **AI Kernel** - Multi-provider routing with automatic failover
3. **Generative Apps** - Dynamic micro-app creation
4. **Knowledge Graph** - Semantic relationship storage
5. **Fluid File System** - Graph-based data organization
