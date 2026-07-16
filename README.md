# 🤖 AI Content Generator Platform

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-FFFF00?style=for-the-badge&logo=chainlink&logoColor=black)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**AI-powered content generator for social media, blogs, and marketing**

[Features](#-features) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 Features

### Content Generation
- 📝 **Blog Posts** - Generate SEO-optimized blog articles
- 📱 **Social Media** - Create engaging posts for Twitter, Instagram, LinkedIn
- 📧 **Email Marketing** - Write compelling email campaigns
- 🎬 **YouTube Scripts** - Generate video scripts and outlines
- 📰 **News Articles** - Create news-style content
- 💬 **Chatbot Responses** - Build conversational AI responses

### AI Models Support
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Ollama (Local LLM)
- Groq (Fast inference)

### Templates & Presets
- 20+ built-in templates
- Custom template creation
- Tone adjustment (professional, casual, witty)
- Multi-language support (Bahasa Indonesia, English)

---

## 🚀 Getting Started

### Prerequisites

```bash
Python 3.11+
Node.js 18+
API Keys (OpenAI, Anthropic, dll)
```

### Quick Start

```bash
# Clone the repository
git clone https://github.com/antono4/ai-content-generator.git
cd ai-content-generator

# Setup Backend
cd backend
cp .env.example .env
# Edit .env with your API keys
pip install -r requirements.txt
uvicorn api.main:app --reload

# Setup Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Docker Setup

```bash
docker-compose up -d
```

---

## 📂 Project Structure

```
ai-content-generator/
├── backend/
│   ├── api/
│   │   ├── routes/          # API endpoints
│   │   ├── dependencies.py   # FastAPI dependencies
│   │   └── main.py          # App entry point
│   ├── models/
│   │   ├── schemas.py       # Pydantic models
│   │   └── database.py      # Database models
│   ├── services/
│   │   ├── content_generator.py
│   │   ├── template_service.py
│   │   └── ai_providers/
│   ├── utils/
│   │   └── helpers.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── package.json
├── docs/
│   └── API.md
├── tests/
└── README.md
```

---

## 📖 API Documentation

### Generate Content

```bash
POST /api/v1/generate
Content-Type: application/json

{
  "content_type": "blog_post",
  "topic": "Benefits of AI in Education",
  "tone": "professional",
  "language": "id",
  "length": "medium",
  "keywords": ["AI", "education", "technology"]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "title": "Mengapa AI Penting dalam Dunia Pendidikan?",
    "content": "Artikel lengkap...",
    "meta_description": "SEO meta description...",
    "hashtags": ["#AI", "#Pendidikan", "#Teknologi"],
    "reading_time": "5 min"
  },
  "usage": {
    "tokens_used": 1500,
    "model": "gpt-4",
    "cost": "$0.03"
  }
}
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/generate` | Generate content |
| GET | `/api/v1/templates` | List all templates |
| POST | `/api/v1/templates` | Create custom template |
| GET | `/api/v1/history` | Get generation history |
| POST | `/api/v1/bulk-generate` | Bulk content generation |

---

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=backend --cov-report=html

# Run specific test
pytest tests/test_content_generator.py -v
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📊 Roadmap

- [ ] Multi-user authentication
- [ ] Team collaboration features
- [ ] Content scheduling & automation
- [ ] Analytics dashboard
- [ ] API rate limiting & caching
- [ ] Custom fine-tuned models
- [ ] Mobile app

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Antono** - Full-Stack Developer | AI Enthusiast

- GitHub: [@antono4](https://github.com/antono4)
- Email: antonockr1@gmail.com
- Website: [antono4.github.io](https://antono4.github.io)

---

<div align="center">

⭐ Jika project ini bermanfaat, bantu dengan star repo ini!

</div>
