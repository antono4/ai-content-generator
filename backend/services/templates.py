"""
Content Templates Service
Provides prompt templates for different content types
"""

from typing import Dict
from models.schemas import ContentType


# Built-in templates for each content type
CONTENT_TEMPLATES: Dict[str, Dict[str, str]] = {
    "blog_post": {
        "name": "Blog Post",
        "description": "SEO-optimized blog article",
        "template": """Tulis artikel blog lengkap tentang topik: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Panjang: ~{length_word_count} kata
- Include keywords: {keywords}
- Format: Markdown dengan heading, subheading, dan paragraf
- Sertakan meta description di akhir (dimulai dengan "Meta: ")

Buat artikel yang informatif, engaging, dan SEO-friendly."""
    },
    
    "social_media": {
        "name": "Social Media Post",
        "description": "Engaging social media content",
        "template": """Buat post social media yang engaging untuk platform: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Include emojis yang relevan
- Sertakan 5-10 hashtags di akhir
- Maks 280 karakter untuk Twitter-style, atau lebih panjang untuk LinkedIn
- Include strong CTA (Call to Action)

Format output:
CONTENT: [text post]
HASHTAGS: [list hashtags]"""
    },
    
    "email": {
        "name": "Email Marketing",
        "description": "Compelling email campaigns",
        "template": """Tulis email marketing yang compelling tentang: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Include subject line yang catchy
- Opening paragraph yang strong
- Body dengan benefits utama
- Clear CTA di akhir
- Professional signature

Format:
SUBJECT: [subject line]
BODY: [full email content]"""
    },
    
    "youtube_script": {
        "name": "YouTube Script",
        "description": "Engaging video scripts",
        "template": """Tulis script YouTube yang engaging tentang: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Panjang: ~{length_word_count} kata (untuk video 5-10 menit)
- Struktur:
  1. HOOK (0:00-0:30) - Opening yang menarik
  2. INTRODUCTION (0:30-1:00) - Perkenalkan topik
  3. MAIN CONTENT - Pembahasan utama
  4. CONCLUSION - Ringkasan dan CTA
- Include B-roll suggestions
- Include timestamps

Format dengan timing untuk setiap section."""
    },
    
    "news_article": {
        "name": "News Article",
        "description": "Objective news coverage",
        "template": """Tulis artikel berita yang objektif tentang: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Struktur pyramid (most important first)
- 5W+1H: What, Who, When, Where, Why, How
- Include quotes (gunakan placeholder)
- Akhiri dengan context atau outlook
- Maks {length_word_count} kata"""
    },
    
    "product_description": {
        "name": "Product Description",
        "description": "Persuasive product copy",
        "template": """Tulis deskripsi produk yang menjual untuk: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Highlight benefits, bukan features
- Include emotional triggers
- Clear value proposition
- Include spesifikasi jika relevan
- Maks 300 kata

Format:
PRODUCT NAME: [name]
HIGHLIGHTS:
- [benefit 1]
- [benefit 2]
- [benefit 3]
DESCRIPTION: [full description]"""
    },
    
    "seo_content": {
        "name": "SEO Content",
        "description": "Search engine optimized articles",
        "template": """Tulis artikel SEO-optimized tentang: {topic}

Persyaratan:
- Target keywords: {keywords}
- Bahasa: {language}
- Panjang: ~{length_word_count} kata
- Include keywords in:
  - Title (termasuk di awal)
  - First paragraph
  - At least 3 subheadings
  - Naturally throughout body
- Include internal link suggestions
- Meta description optimized (150-160 chars)

Akhiri dengan section FAQ dengan 5 pertanyaan umum."""
    },
    
    "chatbot_response": {
        "name": "Chatbot Response",
        "description": "Helpful chatbot replies",
        "template": """Buat response chatbot yang helpful untuk pertanyaan tentang: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Friendly dan informative
- Include suggestions untuk pertanyaan lanjutan
- Maks 3-4 sentences
- Clear dan easy to understand"""
    },
    
    "caption": {
        "name": "Social Media Caption",
        "description": "Catchy captions for posts",
        "template": """Buat 5 caption berbeda untuk post tentang: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Caption #1: Catchy/Provocative
- Caption #2: Story-telling
- Caption #3: Educational
- Caption #4: Humorous
- Caption #5: Inspirational
- Setiap caption include 3-5 relevant hashtags"""
    },
    
    "headline": {
        "name": "Headlines",
        "description": "Attention-grabbing headlines",
        "template": """Buat 10 headline yang attention-grabbing untuk: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Variasi styles:
  - 3x How-to headlines
  - 3x Question headlines  
  - 2x List-based (X ways to...)
  - 2x Emotional/trigger headlines
- Maks 60 karakter per headline
- Include power words"""
    },
    
    "Call to Action": {
        "name": "Call to Action",
        "description": "Persuasive CTAs",
        "template": """Buat 5 Call to Action yang persuasive untuk: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Include urgency elements
- Clear benefit statement
- Action-oriented language
- Variasi: button text, social post CTA, email CTA"""
    },
    
    "testimonial": {
        "name": "Customer Testimonial",
        "description": "Authentic testimonials",
        "template": """Buat testimonial yang authentic tentang: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- Real-sounding customer voice
- Include specific results/numbers
- Address pain points
- Before/after transformation
- Include placeholder name dan company"""
    },
    
    "faq": {
        "name": "FAQ Section",
        "description": "Informative FAQ content",
        "template": """Buat section FAQ tentang: {topic}

Persyaratan:
- Tone: {tone}
- Bahasa: {language}
- 10 pertanyaan umum
- Jawaban yang komprehensif tapi concise
- Use clear question format
- Include related questions section"""
    }
}


def get_template_prompt(content_type: str) -> str:
    """Get the prompt template for a content type"""
    template = CONTENT_TEMPLATES.get(content_type)
    if not template:
        # Fallback to blog post template
        return CONTENT_TEMPLATES["blog_post"]["template"]
    return template["template"]


def get_all_templates() -> Dict[str, Dict[str, str]]:
    """Get all available templates"""
    return CONTENT_TEMPLATES


def get_template_info(content_type: str) -> Dict[str, str]:
    """Get template info (name and description)"""
    template = CONTENT_TEMPLATES.get(content_type)
    if not template:
        return {
            "name": content_type.replace("_", " ").title(),
            "description": f"Custom {content_type} content"
        }
    return {
        "name": template["name"],
        "description": template["description"]
    }
