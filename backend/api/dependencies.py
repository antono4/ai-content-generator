"""
Application Dependencies and Settings
"""

import os
import time
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment"""
    
    # Application
    APP_NAME: str = Field(default="AI Content Generator", env="APP_NAME")
    APP_VERSION: str = Field(default="1.0.0", env="APP_VERSION")
    DEBUG: bool = Field(default=True, env="DEBUG")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # AI Providers
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4", env="OPENAI_MODEL")
    
    ANTHROPIC_API_KEY: str = Field(default="", env="ANTHROPIC_API_KEY")
    ANTHROPIC_MODEL: str = Field(default="claude-3-sonnet-20240229", env="ANTHROPIC_MODEL")
    
    GOOGLE_API_KEY: str = Field(default="", env="GOOGLE_API_KEY")
    GROQ_API_KEY: str = Field(default="", env="GROQ_API_KEY")
    
    # Ollama (Local)
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", env="OLLAMA_BASE_URL")
    OLLAMA_MODEL: str = Field(default="llama2", env="OLLAMA_MODEL")
    
    # Database
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./data/content_generator.db", env="DATABASE_URL")
    
    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=30, env="RATE_LIMIT_PER_MINUTE")
    RATE_LIMIT_PER_DAY: int = Field(default=500, env="RATE_LIMIT_PER_DAY")
    
    # Generation Defaults
    DEFAULT_TONE: str = Field(default="professional", env="DEFAULT_TONE")
    DEFAULT_LANGUAGE: str = Field(default="id", env="DEFAULT_LANGUAGE")
    MAX_TOKENS: int = Field(default=4000, env="MAX_TOKENS")
    TEMPERATURE: float = Field(default=0.7, env="TEMPERATURE")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Application start time for uptime calculation
APP_START_TIME = time.time()
