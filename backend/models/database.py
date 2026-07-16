"""
Database Models and Configuration
"""

import os
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, JSON
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

from api.dependencies import get_settings

settings = get_settings()

# Create data directory
os.makedirs("data", exist_ok=True)

# Database URL
DATABASE_URL = settings.DATABASE_URL

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


class Generation(Base):
    """Model for storing generation history"""
    __tablename__ = "generations"
    
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String(50), nullable=False, index=True)
    topic = Column(String(500), nullable=False)
    tone = Column(String(50), default="professional")
    language = Column(String(10), default="id")
    length = Column(String(20), default="medium")
    keywords = Column(JSON, default=list)
    
    # Generated content
    title = Column(String(500))
    content = Column(Text)
    meta_description = Column(Text)
    hashtags = Column(JSON)
    
    # Usage tracking
    model_used = Column(String(50))
    tokens_used = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Generation(id={self.id}, topic='{self.topic}', type='{self.content_type}')>"


class Template(Base):
    """Model for custom templates"""
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    content_type = Column(String(50), nullable=False, index=True)
    prompt_template = Column(Text, nullable=False)
    description = Column(Text)
    
    # Settings
    is_active = Column(Boolean, default=True)
    isbuiltin = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Template(id={self.id}, name='{self.name}', type='{self.content_type}')>"


class User(Base):
    """Model for user management (future use)"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    name = Column(String(100))
    api_key = Column(String(100), unique=True)
    
    # Usage limits
    daily_limit = Column(Integer, default=500)
    monthly_limit = Column(Integer, default=10000)
    
    # Stats
    total_generations = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime)
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Dependency for getting database session"""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
