<div align="center">

# 🤖 AI Content Generator

**Generate blog posts, social media captions, emails, YouTube scripts, and SEO copy with AI.**

FastAPI backend · React + TypeScript frontend · LangChain · OpenAI / Anthropic

- [![Live Demo](https://img.shields.io/badge/Pages-Repository%20Home-2EA44F?logo=githubpages)](https://antono4.github.io/ai-content-generator/)
- [![API Docs](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?logo=swagger&logoColor=black)](http://localhost:8000/docs)
- [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

</div>

---

## 📖 About

A full-stack web app for generating marketing and editorial content. Pick a content
type, topic, tone, language, and length; the backend builds a prompt from a template
and sends it to an LLM, then returns the draft together with hashtags, a meta
description, and a word count.

It ships with a **demo mode**: if no API key is configured, the backend returns
realistic sample content so the UI stays fully usable. The frontend has the same
fallback, so the app works even when the API is unreachable.

> **Note on GitHub Pages:** Pages is configured to serve the repository root, so
> <https://antono4.github.io/ai-content-generator/> renders this README rather than the
> app. To use the app, run it locally (see [Quick Start](#-quick-start)).

## ✨ Features

- 📝 **13 content types** — blog post, social media, email, YouTube script, news
  article, product description, SEO content, chatbot reply, caption, headline, CTA,
  testimonial, and FAQ
- 🎭 **6 tones** — professional, casual, friendly, formal, witty, empathetic
- 🌐 **6 languages** — Indonesian, English, Malay, Japanese, Korean, Chinese
- 📏 **3 lengths** — short (~150 words), medium (~500), long (~1000)
- 🔑 **SEO keywords** woven into the prompt
- 🤖 **Multiple providers** — OpenAI (GPT-4/…) and Anthropic (Claude)
- 🧾 **History + stats** — track generations, tokens, and models used
- 📦 **Bulk generation** — up to 50 requests in one call
- 🐳 **Docker Compose** — backend, frontend, and optional Redis
- 🧪 **Demo mode** — usable with no API key

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, axios |
| Backend | Python, FastAPI, Pydantic v2, Uvicorn |
| AI | LangChain, OpenAI, Anthropic |
| Data | SQLAlchemy + aiosqlite (SQLite), Redis (optional cache) |
| Ops | Docker, Docker Compose |

## 🚀 Quick Start

### Option A — Docker Compose

```bash
git clone https://github.com/antono4/ai-content-generator.git
cd ai-content-generator
export OPENAI_API_KEY=sk-...        # or ANTHROPIC_API_KEY
docker compose up --build
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:8000> · docs at <http://localhost:8000/docs>

### Option B — Run locally

**Backend**

```bash
cd backend
pip install -r requirements.txt

cp .env.example .env
# set OPENAI_API_KEY (or ANTHROPIC_API_KEY); without a key it runs in demo mode

python -m api.main
```

The API listens on <http://localhost:8000>. Check it with
`curl http://localhost:8000/health`.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:8000
npm run dev
```

Open <http://localhost:3000>. Vite proxies `/api` to the backend on port 8000.

## ⚙️ Configuration

Copy `backend/.env.example` to `backend/.env`. The keys that matter most:

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | – | Enables OpenAI. No key → demo mode |
| `OPENAI_MODEL` | `gpt-4` | OpenAI model name |
| `ANTHROPIC_API_KEY` | – | Enables Claude (used if OpenAI is unset) |
| `ANTHROPIC_MODEL` | `claude-3-sonnet-20240229` | Anthropic model name |
| `DEFAULT_LANGUAGE` | `id` | Default output language |
| `DEFAULT_TONE` | `professional` | Default writing tone |
| `MAX_TOKENS` | `4000` | Output token ceiling |
| `TEMPERATURE` | `0.7` | Creativity (0–2) |
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/content_generator.db` | Database |
| `REDIS_URL` | `redis://localhost:6379/0` | Cache (optional) |

> The provider keys are read by the backend only. Never place them in `frontend/.env`
> — anything prefixed `VITE_` is embedded in the browser bundle.

## 🔌 API

Base path `/api/v1` (health is at the root).

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service status, version, uptime |
| `GET` | `/` | API info |
| `POST` | `/api/v1/generate` | Generate a single piece of content |
| `POST` | `/api/v1/generate/bulk` | Generate up to 50 items |
| `GET` | `/api/v1/stats` | Usage statistics |
| `GET` | `/api/v1/templates` | List templates (optional `?content_type=`) |
| `GET` | `/api/v1/templates/{content_type}` | One template |
| `POST` | `/api/v1/templates` | Create a custom template |
| `GET` | `/api/v1/history` | Paginated history |
| `GET` | `/api/v1/history/{id}` | One history item |
| `DELETE` | `/api/v1/history` | Clear history |

Interactive docs are generated automatically at `/docs` (Swagger) and `/redoc`.

### Example

```bash
curl -X POST http://localhost:8000/api/v1/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "content_type": "blog_post",
    "topic": "AI in education",
    "tone": "professional",
    "language": "id",
    "length": "medium",
    "keywords": ["AI", "education"]
  }'
```

```json
{
  "success": true,
  "data": {
    "title": "Mengapa AI in education Penting untuk Diketahui",
    "content": "# AI in education\n\n## Pendahuluan\n…",
    "meta_description": "Pelajari segala tentang AI in education…",
    "hashtags": ["#AIineducation", "#Teknologi", "#Inovasi"],
    "reading_time": "5 min"
  },
  "usage": { "tokens_used": 0, "model": "demo-mode", "cost": "$0.00" }
}
```

## 📁 Project Structure

```
ai-content-generator/
├── backend/
│   ├── api/
│   │   ├── main.py            # FastAPI app, middleware, lifespan
│   │   ├── routes.py          # health, generate, templates, history, stats
│   │   └── dependencies.py    # settings loaded from .env
│   ├── models/
│   │   ├── schemas.py         # Pydantic request/response models
│   │   └── database.py        # SQLAlchemy + SQLite setup
│   ├── services/
│   │   ├── content_generator.py  # LangChain LLM calls + demo content
│   │   └── templates.py          # prompt templates per content type
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # UI: content type, tone, language, result
│   │   └── services/api.ts    # axios client + offline demo fallback
│   ├── index.html
│   └── Dockerfile
├── docker-compose.yml
└── LICENSE
```

## 🧭 How Generation Works

1. The request is validated against `GenerationRequest` (content type, tone, language,
   length, keywords).
2. `services/templates.py` supplies a prompt template for the content type; placeholders
   like `{topic}` and `{tone}` are filled in.
3. `ContentGenerator` calls the configured LLM through LangChain (retried up to 3 times
   with exponential backoff).
4. The reply is parsed into `GeneratedContent` — title, body, meta description,
   hashtags, reading time.
5. Usage is recorded and the result is added to history.

With no API key, step 3 is skipped and sample content is returned instead.

## 🤝 Contributing

Issues and pull requests are welcome. For larger changes, open an issue first so we can
agree on the approach.

## 📄 License

Released under the [MIT License](./LICENSE). © 2024 Antono.

---

<div align="center">

Made with ❤️ in Indonesia 🇮🇩 · [GitHub](https://github.com/antono4)

</div>
