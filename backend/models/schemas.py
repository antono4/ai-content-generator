"""
Pydantic Models / Schemas for API Request/Response
"""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict


# ============= Content Types =============
ContentType = Literal[
    "blog_post",
    "social_media",
    "email",
    "youtube_script",
    "news_article",
    "product_description",
    "seo_content",
    "chatbot_response",
    "caption",
    "headline",
    "Call to Action",
    "testimonial",
    "faq"
]

ToneType = Literal["professional", "casual", "friendly", "formal", "witty", "empathetic"]
LanguageType = Literal["id", "en", "ms", "jp", "kr", "cn"]
LengthType = Literal["short", "medium", "long"]


# ============= Generation Request/Response =============
class GenerationRequest(BaseModel):
    """Request model for content generation"""
    content_type: ContentType = Field(..., description="Type of content to generate")
    topic: str = Field(..., min_length=3, max_length=500, description="Main topic/keyword")
    tone: ToneType = Field(default="professional", description="Writing tone")
    language: LanguageType = Field(default="id", description="Output language")
    length: LengthType = Field(default="medium", description="Content length")
    keywords: Optional[List[str]] = Field(default=[], description="SEO keywords to include")
    model: Optional[str] = Field(default="gpt-4", description="AI model to use")
    temperature: Optional[float] = Field(default=0.7, ge=0, le=2, description="AI creativity level")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "content_type": "blog_post",
                "topic": "Benefits of AI in Education",
                "tone": "professional",
                "language": "id",
                "length": "medium",
                "keywords": ["AI", "education", "technology"]
            }
        }
    )


class GenerationResponse(BaseModel):
    """Response model for content generation"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    usage: Optional[dict] = None


class GeneratedContent(BaseModel):
    """Generated content data"""
    title: str
    content: str
    meta_description: Optional[str] = None
    hashtags: Optional[List[str]] = None
    reading_time: Optional[str] = None
    word_count: Optional[int] = None
    keywords_found: Optional[List[str]] = None


# ============= Templates =============
class TemplateBase(BaseModel):
    """Base template model"""
    name: str = Field(..., min_length=1, max_length=100)
    content_type: ContentType
    prompt_template: str
    description: Optional[str] = None
    is_active: bool = True


class TemplateCreate(TemplateBase):
    """Model for creating a template"""
    pass


class TemplateResponse(TemplateBase):
    """Model for template response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TemplateList(BaseModel):
    """List of templates response"""
    templates: List[TemplateResponse]
    total: int


# ============= History =============
class HistoryItem(BaseModel):
    """History item model"""
    id: int
    content_type: ContentType
    topic: str
    generated_content: str
    model_used: str
    tokens_used: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class HistoryList(BaseModel):
    """List of history items"""
    items: List[HistoryItem]
    total: int
    page: int
    per_page: int


# ============= Health Check =============
class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    uptime: float
    database: str
    cache: str


# ============= Bulk Generation =============
class BulkGenerationRequest(BaseModel):
    """Request model for bulk generation"""
    items: List[GenerationRequest] = Field(..., max_length=50)
    delay_seconds: int = Field(default=2, ge=1, le=10)


class BulkGenerationResponse(BaseModel):
    """Response model for bulk generation"""
    success: bool
    results: List[GenerationResponse]
    total_tokens: int
    total_cost: float


# ============= Analytics =============
class UsageStats(BaseModel):
    """Usage statistics"""
    total_generations: int
    total_tokens: int
    total_cost: float
    by_content_type: dict
    by_model: dict
    period_start: datetime
    period_end: datetime
