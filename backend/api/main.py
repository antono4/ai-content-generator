"""
AI Content Generator - Main FastAPI Application
Author: Antono | https://github.com/antono4
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from api.routes import (
    generate_router,
    templates_router,
    history_router,
    health_router
)
from api.dependencies import get_settings
from models.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    logger.info("🚀 Starting AI Content Generator...")
    
    # Initialize database
    await init_db()
    logger.info("✅ Database initialized")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down AI Content Generator...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
    settings = get_settings()
    
    app = FastAPI(
        title=settings.APP_NAME,
        description="""
## 🤖 AI Content Generator API

Generate high-quality content for social media, blogs, emails, and more using AI.

### Features:
- 📝 Multiple content types (blog, social media, email, etc.)
- 🤖 Multiple AI providers (OpenAI, Anthropic, Google, Ollama)
- 🌐 Multi-language support (Indonesian, English)
- 📊 Usage tracking and analytics
- ⚡ Fast inference with caching

### Getting Started:
1. Get your API key from OpenAI/Anthropic
2. Set your API key in the .env file
3. Start generating content!
        """,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )
    
    # Add middleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(health_router, tags=["Health"])
    app.include_router(generate_router, prefix="/api/v1", tags=["Content Generation"])
    app.include_router(templates_router, prefix="/api/v1", tags=["Templates"])
    app.include_router(history_router, prefix="/api/v1", tags=["History"])
    
    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": str(exc) if settings.DEBUG else "Something went wrong"
            }
        )
    
    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        import time
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s"
        )
        
        return response
    
    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
