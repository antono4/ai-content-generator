# AetherOS Architecture Schema

## 1. System Overview

AetherOS is a next-generation experimental operating system that runs as a hybrid cloud/local web ecosystem.

### Layers
- **Presentation Layer**: 3D Spatial Environment, Micro-Apps Renderer, Command Interface
- **AI Kernel Layer**: Intent Analyzer, Model Router, Response Synthesizer, Context Manager
- **Generative Engine Layer**: Component Generator, Style Synthesizer, State Manager, Sandbox Runner
- **Knowledge Graph Layer**: Vector DB, Graph DB, Semantic Index, Memory Store

## 2. Data Flow

```
User Input → Intent Parser → AI Kernel → Response Synthesizer
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              [Code Gen]     [Knowledge]     [Action]
```

## 3. Key Components

### AI Kernel
- **ModelRouter**: Automatically selects best available model
- **FailoverChain**: Sequential fallback on errors
- **ContextWindow**: Manages conversation history

### Generative Engine
- **ComponentGenerator**: Creates React/HTML components
- **StyleSynthesizer**: Generates CSS matching spatial theme
- **SandboxRunner**: Isolated execution environment

### Knowledge Graph
- **SemanticIndex**: Hybrid search (vector + keyword)
- **GraphService**: CRUD operations on relationships
