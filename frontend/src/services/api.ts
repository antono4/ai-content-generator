import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface GenerationRequest {
  content_type: string;
  topic: string;
  tone: string;
  language: string;
  length: string;
  keywords?: string[];
  model?: string;
  temperature?: number;
}

export interface GeneratedContent {
  title: string;
  content: string;
  meta_description?: string;
  hashtags?: string[];
  reading_time?: string;
  word_count?: number;
}

export interface UsageInfo {
  tokens_used: number;
  model: string;
  cost: string;
}

export interface GenerationResponse {
  success: boolean;
  data?: GeneratedContent;
  error?: string;
  usage?: UsageInfo;
}

export interface Template {
  id: number;
  name: string;
  content_type: string;
  description?: string;
  prompt_template: string;
  is_active: boolean;
}

export interface TemplateList {
  templates: Template[];
  total: number;
}

// Demo content generator (fallback when API is not available)
const generateDemoContent = (request: GenerationRequest): GenerationResponse => {
  const templates: Record<string, { title: string; content: string }> = {
    blog_post: {
      title: `Mengapa ${request.topic} Penting untuk Diketahui`,
      content: `# ${request.topic}

## Pendahuluan

${request.topic} adalah topik yang sangat relevan di era digital saat ini. Artikel ini akan membahas secara mendalam tentang berbagai aspek yang berkaitan dengan ${request.topic}.

## Apa Itu ${request.topic}?

${request.topic} merujuk pada konsep atau praktik yang berkaitan dengan teknologi modern dan inovasi. Pemahaman yang baik tentang topik ini dapat memberikan keuntungan kompetitif yang signifikan dalam dunia kerja dan bisnis.

## Manfaat Utama

1. **Efisiensi** - Meningkatkan produktivitas dan efisiensi kerja hingga 40%
2. **Inovasi** - Mendorong kreativitas dan inovasi dalam tim
3. **Kompetitif** - Memberikan keunggulan kompetitif di pasar
4. **Skalabilitas** - Mendukung pertumbuhan bisnis yang sustainable

## Tips Implementasi

- Mulai dengan langkah kecil dan konsisten
- Evaluasi hasil secara berkala
- Adaptasi dengan kebutuhan spesifik

## Kesimpulan

${request.topic} akan terus berkembang dan menjadi semakin penting. Mulailah eksplorasi Anda hari ini dan jangan takut untuk mencoba hal baru!`,
    },
    social_media: {
      title: `Post tentang ${request.topic}`,
      content: `🚀 ${request.topic} - Apa yang perlu kamu tahu!

BENER BENER GAME CHANGER! 💯

Benefit utama yang kamu dapet:
✅ Tingkatkan produktivitas
✅ Hemat waktu & biaya
✅ Easy to implement
✅ Instant results

Siap upgrade skill kamu? 👇

#${request.topic.replace(/\s+/g, '')} #TechTips #Innovation #Growth #Success`,
    },
    email: {
      title: `Special Update: ${request.topic}`,
      content: `Subject: 🎁 Update Penting tentang ${request.topic}

Halo,

Semoga email ini menemukan kamu dalam kondisi baik!

${request.topic} adalah topik yang sedang trending dan kami ingin berbagi insight terbaru dengan kamu.

📌 Yang Akan Kita Bahas:
• Tips dan trick terbaru
• Best practices dari para expert
• Case study sukses

Klik tombol di bawah untuk informasi lebih lanjut:

[Pelajari Sekarang]

Best regards,
Tim Kami`,
    },
    youtube_script: {
      title: `YouTube Script: ${request.topic}`,
      content: `[HOOK - 0:00-0:30]
Apa yang terjadi jika kita memahami ${request.topic} dengan mendalam?

[INTRO - 0:30-1:00]
Hey guys, welcome back! Hari ini kita akan bahas topik yang都非常 penting...

[MAIN CONTENT - 1:00-8:00]
Poin 1: ${request.topic} basics
Poin 2: Advanced techniques
Poin 3: Common mistakes & how to avoid them

[OUTRO - 8:00-9:00]
Jadi itulah semuanya! Jangan lupa like, subscribe, dan share video ini!
See you di video selanjutnya!`,
    },
    seo_content: {
      title: `Panduan Lengkap ${request.topic} | SEO Guide 2024`,
      content: `# Panduan Lengkap ${request.topic} untuk SEO

## Meta Description
Pelajari segala tentang ${request.topic} dalam panduan lengkap ini. Temukan manfaat, tips, dan strategi terbaik untuk meningkatkan website Anda.

## Pendahuluan
${request.topic} adalah faktor penting dalam SEO modern. Dengan pemahaman yang tepat, Anda dapat meningkatkan traffic website secara signifikan.

## Section 1: Apa itu ${request.topic}?
Definisi dan penjelasan lengkap...

## Section 2: Cara Implementasi
Step-by-step guide...

## Section 3: Best Practices
Tips dari para ahli...

## FAQ
**Q: Berapa lama untuk melihat hasil?**
A: Biasanya 3-6 bulan

**Q: Apakah mahal?**
A: Tergantung skala implementasi`,
    },
  };

  const template = templates[request.content_type] || templates.blog_post;
  const wordCount = template.content.split(/\s+/).length;

  return {
    success: true,
    data: {
      title: template.title,
      content: template.content,
      meta_description: `Pelajari segala tentang ${request.topic} dalam panduan lengkap ini.`,
      hashtags: [
        `#${request.topic.replace(/\s+/g, '')}`,
        '#Tech',
        '#Innovation',
        '#Digital',
        '#Growth',
      ],
      reading_time: `${Math.ceil(wordCount / 200)} min`,
      word_count: wordCount,
    },
    usage: {
      tokens_used: 0,
      model: 'demo-mode',
      cost: '$0.00',
    },
  };
};

// API Functions
export const generateContent = async (request: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const response = await api.post<GenerationResponse>('/api/v1/generate', request);
    return response.data;
  } catch (error: any) {
    // Return demo content as fallback
    console.log('API not available, using demo mode');
    return generateDemoContent(request);
  }
};

export const getTemplates = async (): Promise<TemplateList> => {
  try {
    const response = await api.get<TemplateList>('/api/v1/templates');
    return response.data;
  } catch {
    return { templates: [], total: 0 };
  }
};

export const getHealth = async (): Promise<{ status: string; version: string }> => {
  try {
    const response = await api.get('/api/v1/health');
    return response.data;
  } catch {
    return { status: 'error', version: 'unknown' };
  }
};

export const getStats = async (): Promise<any> => {
  try {
    const response = await api.get('/api/v1/stats');
    return response.data;
  } catch {
    return null;
  }
};

export default api;
