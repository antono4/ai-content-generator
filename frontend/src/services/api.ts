import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// API Functions
export const generateContent = async (request: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const response = await api.post<GenerationResponse>('/api/v1/generate', request);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to generate content',
    };
  }
};

export const getTemplates = async (): Promise<TemplateList> => {
  try {
    const response = await api.get<TemplateList>('/api/v1/templates');
    return response.data;
  } catch (error) {
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
