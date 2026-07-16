"""
AI Content Generator Service
Handles content generation using various AI providers
"""

import re
import logging
from typing import Optional, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain.schema import HumanMessage, SystemMessage
from tenacity import retry, stop_after_attempt, wait_exponential

from models.schemas import (
    GenerationRequest,
    GeneratedContent,
    ToneType,
    LanguageType,
    ContentType,
    LengthType
)
from api.dependencies import get_settings
from services.templates import get_template_prompt

logger = logging.getLogger(__name__)
settings = get_settings()


# Language names mapping
LANGUAGE_NAMES = {
    "id": "Bahasa Indonesia",
    "en": "English",
    "ms": "Bahasa Melayu",
    "jp": "Japanese",
    "kr": "Korean",
    "cn": "Chinese"
}

# Length word counts
LENGTH_WORD_COUNTS = {
    "short": 150,
    "medium": 500,
    "long": 1000
}


class ContentGenerator:
    """Main content generation service"""
    
    def __init__(self):
        self.llm = None
        self._setup_llm()
    
    def _setup_llm(self):
        """Initialize the language model"""
        try:
            if settings.OPENAI_API_KEY:
                self.llm = ChatOpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    model=settings.OPENAI_MODEL,
                    temperature=settings.TEMPERATURE
                )
                logger.info(f"Initialized OpenAI with model: {settings.OPENAI_MODEL}")
            elif settings.ANTHROPIC_API_KEY:
                self.llm = ChatAnthropic(
                    api_key=settings.ANTHROPIC_API_KEY,
                    model=settings.ANTHROPIC_MODEL
                )
                logger.info(f"Initialized Anthropic with model: {settings.ANTHROPIC_MODEL}")
            else:
                logger.warning("No AI API key configured!")
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {e}")
    
    def _get_system_prompt(self, content_type: ContentType) -> str:
        """Get system prompt based on content type"""
        prompts = {
            "blog_post": """Kamu adalah penulis blog profesional yang berpengalaman. 
            Tulis artikel yang engaging, informatif, dan SEO-friendly.""",
            
            "social_media": """Kamu adalah ahli media sosial yang tahu cara membuat konten viral.
            Buat caption yang menarik, menggunakan emoji yang tepat, dan include hashtags.""",
            
            "email": """Kamu adalah copywriter email profesional.
            Tulis email yang compelling dengan subject line yang menarik.""",
            
            "youtube_script": """Kamu adalah scriptwriter YouTube profesional.
            Buat script yang engaging dengan hook yang kuat di awal.""",
            
            "news_article": """Kamu adalah jurnalis yang objektif dan akurat.
            Tulis artikel berita yang informatif dan balanced.""",
            
            "product_description": """Kamu adalah copywriter produk e-commerce.
            Tulis deskripsi yang menjual dan highlight benefits utama.""",
            
            "seo_content": """Kamu adalah SEO specialist.
            Buat konten yang dioptimasi untuk search engines dengan keyword yang natural.""",
            
            "chatbot_response": """Kamu adalah customer service AI yang helpful.
            Responden dengan ramah, profesional, dan informatif.""",
            
            "caption": """Kamu adalah social media expert.
            Buat caption yang catchy dan encourage engagement.""",
            
            "headline": """Kamu adalah headline writer profesional.
            Buat headline yang attention-grabbing dan compelling.""",
            
            "Call to Action": """Kamu adalah conversion rate optimization expert.
            Buat CTA yang jelas dan persuasive.""",
            
            "testimonial": """Kamu adalah testimonial writer.
            Buat testimonial yang authentic dan believable.""",
            
            "faq": """Kamu adalah content writer.
            Buat FAQ yang informatif dan answer common questions."""
        }
        return prompts.get(content_type, prompts["blog_post"])
    
    def _get_user_prompt(
        self,
        request: GenerationRequest
    ) -> str:
        """Build the user prompt based on request"""
        template = get_template_prompt(request.content_type)
        
        # Replace placeholders in template
        prompt = template.format(
            topic=request.topic,
            tone=request.tone,
            language=LANGUAGE_NAMES.get(request.language, "English"),
            length_word_count=LENGTH_WORD_COUNTS.get(request.length, 500),
            keywords=", ".join(request.keywords) if request.keywords else "none"
        )
        
        return prompt
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def generate(self, request: GenerationRequest) -> Dict[str, Any]:
        """Generate content based on request"""
        
        if not self.llm:
            # Demo mode - return sample content
            return self._generate_demo_content(request)
        
        try:
            system_prompt = self._get_system_prompt(request.content_type)
            user_prompt = self._get_user_prompt(request)
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            # Generate response
            response = await self.llm.agenerate([messages])
            
            # Extract content
            generated_text = response.generations[0][0].text
            
            # Parse and structure the response
            result = self._parse_generated_content(generated_text, request)
            
            # Calculate usage
            usage = {
                "tokens_used": response.llm_output.get("token_usage", {}).get("total_tokens", 0) if hasattr(response, 'llm_output') else 0,
                "model": settings.OPENAI_MODEL if settings.OPENAI_API_KEY else settings.ANTHROPIC_MODEL,
                "cost": self._calculate_cost(response)
            }
            
            return {
                "success": True,
                "data": result,
                "usage": usage
            }
            
        except Exception as e:
            logger.error(f"Generation error: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": None,
                "usage": None
            }
    
    def _generate_demo_content(self, request: GenerationRequest) -> Dict[str, Any]:
        """Generate demo content when no API key is configured"""
        
        topic = request.topic
        
        templates = {
            "blog_post": {
                "title": f"Mengapa {topic} Penting untuk Diketahui",
                "content": f"""
# {topic}: Panduan Lengkap

## Pendahuluan

{topic} adalah topik yang sangat relevan di era digital saat ini. Dalam artikel ini, kita akan membahas secara mendalam tentang berbagai aspek dari {topic}.

## Apa itu {topic}?

{topic} merujuk pada konsep atau praktik yang berkaitan dengan teknologi modern dan inovasi. Pemahaman yang baik tentang {topic} dapat memberikan keuntungan kompetitif yang signifikan.

## Manfaat {topic}

1. **Efisiensi** - Meningkatkan produktivitas dan efisiensi kerja
2. **Inovasi** - Mendorong kreativitas dan inovasi
3. **Kompetitif** - Memberikan keunggulan kompetitif
4. **Skalabilitas** - Mendukung pertumbuhan bisnis

## Kesimpulan

{topic} akan terus berkembang dan menjadi semakin penting. Mulailah eksplorasi Anda hari ini!
                """.strip(),
                "meta_description": f"Pelajari segala tentang {topic} dalam panduan lengkap ini. Temukan manfaat, tips, dan strategi terbaik.",
                "hashtags": ["#" + topic.replace(" ", ""), "#Teknologi", "#Inovasi", "#Digital"],
                "reading_time": "5 min"
            },
            "social_media": {
                "title": f"Post tentang {topic}",
                "content": f"""🚀 {topic} - Apa yang perlu kamu tahu!

{topic} sedang trending! 💯

Benefit utama:
✓ Meningkatkan produktivitas
✓ Hemat waktu & biaya
✓ Easy to implement

Siap upgrade skill kamu? 👇

#{topic.replace(' ', '')} #TechTips #Innovation""",
                "meta_description": None,
                "hashtags": ["#" + topic.replace(" ", ""), "#TechTips", "#Innovation"],
                "reading_time": None
            },
            "email": {
                "title": f"Special Offer: {topic}",
                "content": f"""Subject: 🎁 Dapatkan Insights tentang {topic} - FREE!

Halo [Nama],

{topic} bisa mengubah cara kamu bekerja!

Di email ini, kami akan share:
📌 Tips praktis yang bisa langsung diterapkan
📌 Case study dari perusahaan sukses
📌 Resources eksklusif untukmu

Klik tombol di bawah untuk akses FULL CONTENT:

[CTA Button: Pelajari Sekarang]

Best regards,
Tim Kami

---
Unsubscribe | Preferences""",
                "meta_description": None,
                "hashtags": None,
                "reading_time": None
            }
        }
        
        # Get template based on content type, fallback to blog_post
        template = templates.get(request.content_type, templates["blog_post"])
        
        # Calculate word count
        word_count = len(template["content"].split())
        reading_time = f"{max(1, word_count // 200)} min"
        
        return {
            "success": True,
            "data": {
                **template,
                "word_count": word_count,
                "reading_time": reading_time
            },
            "usage": {
                "tokens_used": 0,
                "model": "demo-mode",
                "cost": "$0.00"
            }
        }
    
    def _parse_generated_content(
        self,
        text: str,
        request: GenerationRequest
    ) -> Dict[str, Any]:
        """Parse and structure the generated content"""
        
        # Extract hashtags from content
        hashtags = re.findall(r'#\w+', text)
        
        # Extract title (first # heading)
        title_match = re.search(r'^#\s+(.+)$', text, re.MULTILINE)
        title = title_match.group(1) if title_match else request.topic
        
        # Calculate word count and reading time
        word_count = len(text.split())
        reading_time = f"{max(1, word_count // 200)} min"
        
        # Generate meta description if not present
        meta_description = None
        if "meta description" in text.lower():
            meta_match = re.search(r'meta description:?\s*(.+?)(?:\n|$)', text, re.I)
            if meta_match:
                meta_description = meta_match.group(1).strip()
        
        return {
            "title": title,
            "content": text,
            "meta_description": meta_description or f"Learn about {request.topic} in this comprehensive guide.",
            "hashtags": hashtags[:10] if hashtags else [],
            "reading_time": reading_time,
            "word_count": word_count
        }
    
    def _calculate_cost(self, response) -> str:
        """Calculate approximate cost of generation"""
        # Simplified cost calculation
        try:
            usage = response.llm_output.get("token_usage", {})
            total_tokens = usage.get("total_tokens", 0)
            # Approximate cost: $0.03 per 1000 tokens for GPT-4
            cost = (total_tokens / 1000) * 0.03
            return f"${cost:.4f}"
        except:
            return "$0.0000"


# Singleton instance
content_generator = ContentGenerator()


async def generate_content(request: GenerationRequest) -> Dict[str, Any]:
    """Async wrapper for content generation"""
    return await content_generator.generate(request)
