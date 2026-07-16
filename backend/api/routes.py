"""
API Routes
"""

import time
import logging
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks

from models.schemas import (
    GenerationRequest,
    GenerationResponse,
    TemplateResponse,
    TemplateList,
    TemplateCreate,
    HistoryItem,
    HistoryList,
    HealthResponse,
    BulkGenerationRequest,
    BulkGenerationResponse
)
from services.content_generator import generate_content
from services.templates import get_all_templates, get_template_info
from api.dependencies import get_settings, APP_START_TIME

logger = logging.getLogger(__name__)
settings = get_settings()

# ============= Health Router =============
health_router = APIRouter()


@health_router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health status"""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        uptime=time.time() - APP_START_TIME,
        database="connected",
        cache="connected"
    )


@health_router.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🤖 AI Content Generator API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


# ============= Generation Router =============
generate_router = APIRouter()

# In-memory storage for demo (use database in production)
generation_history = []


@generate_router.post("/generate", response_model=GenerationResponse)
async def generate_content_endpoint(request: GenerationRequest):
    """
    Generate content based on the provided parameters.
    
    - **content_type**: Type of content (blog_post, social_media, email, etc.)
    - **topic**: Main topic or keyword
    - **tone**: Writing tone (professional, casual, friendly, etc.)
    - **language**: Output language (id, en, ms, etc.)
    - **length**: Content length (short, medium, long)
    - **keywords**: SEO keywords to include
    """
    logger.info(f"Generating {request.content_type} content for: {request.topic}")
    
    try:
        result = await generate_content(request)
        
        if result.get("success"):
            # Store in history
            generation_history.append({
                "id": len(generation_history) + 1,
                "content_type": request.content_type,
                "topic": request.topic,
                "generated_content": result["data"]["content"][:500],  # Store preview
                "model_used": result["usage"]["model"],
                "tokens_used": result["usage"]["tokens_used"],
                "created_at": datetime.now()
            })
            
            return GenerationResponse(
                success=True,
                data=result["data"],
                usage=result["usage"]
            )
        else:
            raise HTTPException(status_code=500, detail=result.get("error"))
            
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        return GenerationResponse(
            success=False,
            error=str(e)
        )


@generate_router.post("/generate/bulk", response_model=BulkGenerationResponse)
async def bulk_generate(request: BulkGenerationRequest):
    """
    Generate multiple content items in bulk.
    Useful for batch content creation.
    
    - **items**: List of generation requests (max 50)
    - **delay_seconds**: Delay between requests to avoid rate limits
    """
    logger.info(f"Bulk generating {len(request.items)} items")
    
    results = []
    total_tokens = 0
    total_cost = 0.0
    
    for i, item in enumerate(request.items):
        try:
            result = await generate_content(item)
            results.append(result)
            
            if result.get("usage"):
                total_tokens += result["usage"].get("tokens_used", 0)
                # Parse cost
                cost_str = result["usage"].get("cost", "$0")
                try:
                    total_cost += float(cost_str.replace("$", ""))
                except:
                    pass
            
            # Add delay to avoid rate limits (except for last item)
            if i < len(request.items) - 1:
                time.sleep(request.delay_seconds)
                
        except Exception as e:
            results.append({
                "success": False,
                "error": str(e)
            })
    
    return BulkGenerationResponse(
        success=all(r.get("success", False) for r in results),
        results=results,
        total_tokens=total_tokens,
        total_cost=total_cost
    )


# ============= Templates Router =============
templates_router = APIRouter()


@templates_router.get("/templates", response_model=TemplateList)
async def list_templates(
    content_type: str = Query(None, description="Filter by content type")
):
    """
    Get all available content templates.
    
    Optionally filter by content_type.
    """
    all_templates = get_all_templates()
    
    if content_type:
        if content_type in all_templates:
            templates = [{
                "id": i,
                "name": all_templates[content_type]["name"],
                "content_type": content_type,
                "description": all_templates[content_type]["description"],
                "prompt_template": all_templates[content_type]["template"],
                "is_active": True,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }]
        else:
            templates = []
    else:
        templates = [
            {
                "id": i,
                "name": info["name"],
                "content_type": ct,
                "description": info["description"],
                "prompt_template": info["template"],
                "is_active": True,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            for i, (ct, info) in enumerate(all_templates.items())
        ]
    
    return TemplateList(
        templates=templates,
        total=len(templates)
    )


@templates_router.get("/templates/{content_type}")
async def get_template(content_type: str):
    """Get a specific template by content type"""
    template = get_template_info(content_type)
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {
        "content_type": content_type,
        **template
    }


@templates_router.post("/templates", response_model=TemplateResponse)
async def create_template(template: TemplateCreate):
    """
    Create a custom template.
    
    Note: In production, this would save to a database.
    """
    # In demo mode, just return the template
    return TemplateResponse(
        id=999,
        name=template.name,
        content_type=template.content_type,
        prompt_template=template.prompt_template,
        description=template.description,
        is_active=template.is_active,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )


# ============= History Router =============
history_router = APIRouter()


@history_router.get("/history", response_model=HistoryList)
async def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    content_type: str = Query(None)
):
    """
    Get content generation history.
    
    - **page**: Page number
    - **per_page**: Items per page (max 100)
    - **content_type**: Filter by content type
    """
    filtered_history = generation_history
    
    if content_type:
        filtered_history = [
            h for h in filtered_history
            if h["content_type"] == content_type
        ]
    
    # Paginate
    start = (page - 1) * per_page
    end = start + per_page
    paginated = filtered_history[start:end]
    
    return HistoryList(
        items=[HistoryItem(**item) for item in paginated],
        total=len(filtered_history),
        page=page,
        per_page=per_page
    )


@history_router.delete("/history")
async def clear_history():
    """Clear all generation history"""
    global generation_history
    generation_history = []
    return {"message": "History cleared", "success": True}


@history_router.get("/history/{history_id}")
async def get_history_item(history_id: int):
    """Get a specific history item"""
    for item in generation_history:
        if item["id"] == history_id:
            return item
    
    raise HTTPException(status_code=404, detail="History item not found")


# ============= Stats Router =============
@generate_router.get("/stats")
async def get_stats():
    """Get usage statistics"""
    if not generation_history:
        return {
            "total_generations": 0,
            "total_tokens": 0,
            "by_content_type": {},
            "by_model": {}
        }
    
    by_type = {}
    by_model = {}
    total_tokens = 0
    
    for item in generation_history:
        # Count by type
        ct = item["content_type"]
        by_type[ct] = by_type.get(ct, 0) + 1
        
        # Count by model
        model = item["model_used"]
        by_model[model] = by_model.get(model, 0) + 1
        
        # Sum tokens
        total_tokens += item.get("tokens_used", 0)
    
    return {
        "total_generations": len(generation_history),
        "total_tokens": total_tokens,
        "by_content_type": by_type,
        "by_model": by_model
    }
