# AetherOS - Cognitive Spatial Operating System

## Overview

AetherOS is a next-generation experimental operating system that breaks traditional computing boundaries. Instead of being installed on a hard drive, it runs as a hybrid cloud/local web ecosystem where AI generates functionality dynamically based on user intent.

## Core Concepts

### Zero-Desktop Spatial UI
- Traditional desktop replaced with interactive 3D web simulation
- Tasks, chat history, and tools exist as physical objects/particles in 3D space
- Objects react to physics laws and can be rotated, zoomed, or connected

### No-Install Ecosystem
- No built-in software - everything is generated dynamically by AI
- When users need functionality (POS, IT asset management, image generation), the AI kernel writes HTML/CSS/React components in memory and renders them instantly in the 3D environment

### Dynamic AI Routing
- Multi-model abstraction layer automatically detects model availability (OpenAI, Gemini, Claude, etc.)
- Auto-switches if errors occur, ensuring the OS remains responsive

### Fluid File System
- Replaces tree-based directories with vector database and knowledge graph
- All data (text, images, code) connected by semantic context, not file location

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AetherOS Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Frontend   │     │   Backend    │     │   Database   │    │
│  │   (3D/Web)   │◄───►│  (Node/Py)   │◄───►│   (Vector)   │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│        │                    │                    │              │
│        ▼                    ▼                    ▼              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    AI Kernel Layer                      │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │    │
│  │  │ OpenAI  │ │ Gemini  │ │ Claude  │ │ Local Models│   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Generative Micro-Apps Engine                │    │
│  │     Dynamic Component Generation & Runtime Rendering    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Knowledge Graph Layer                        │    │
│  │     Semantic Connections & Context-Aware Storage         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Or run with Docker
docker-compose up
```

## Tech Stack

- **Frontend**: Three.js, WebGL, React, Webpack
- **Backend**: Node.js, Express, Socket.IO
- **AI Providers**: OpenAI GPT-4, Google Gemini, Anthropic Claude
- **Database**: Redis (caching), Pinecone/Weaviate (vectors), Neo4j (graph)
- **Python Services**: FastAPI for ML/embedding services

## License

MIT
