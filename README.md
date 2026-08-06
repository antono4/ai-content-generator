# AI Content Generator

🤖 AI-powered content generator for creating high-quality blog posts, social media content, emails, YouTube scripts, and more.

## Features

- 📝 **Multiple Content Types**: Blog posts, social media, emails, YouTube scripts, SEO content, and more
- 🤖 **Multiple AI Providers**: Support for OpenAI (GPT-4) and Anthropic (Claude)
- 🌐 **Multi-Language Support**: Generate content in Indonesian, English, Malay, and more
- 📊 **Usage Tracking**: Monitor token usage and costs
- ⚡ **Fast & Easy**: Generate content in seconds

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional)

### Using Docker Compose

```bash
# Clone the repository
git clone https://github.com/antono4/ai-content-generator.git
cd ai-content-generator

# Create .env file with your API keys
echo "OPENAI_API_KEY=your-api-key-here" > .env

# Start all services
docker-compose up -d
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your-api-key-here

# Run the server
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/generate` | POST | Generate content |
| `/api/v1/templates` | GET | List all templates |
| `/api/v1/history` | GET | Get generation history |
| `/api/v1/stats` | GET | Get usage statistics |
| `/health` | GET | Health check |

## Configuration

Configure via environment variables or `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `OPENAI_MODEL` | OpenAI model | `gpt-4` |
| `ANTHROPIC_MODEL` | Anthropic model | `claude-3-sonnet-20240229` |
| `DEBUG` | Debug mode | `true` |

## Tech Stack

**Backend:**
- FastAPI
- LangChain
- SQLAlchemy
- Redis

**Frontend:**
- React
- TypeScript
- Tailwind CSS
- Vite

## License

MIT License - See [LICENSE](LICENSE) for details.

## Author

Built with ❤️ by [Antono](https://github.com/antono4)
