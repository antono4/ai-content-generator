/**
 * Gemini Provider - Integration with Google Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider {
  constructor(options = {}) {
    this.client = options.apiKey
      ? new GoogleGenerativeAI(options.apiKey)
      : new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    this.model = options.model || 'gemini-pro';
    this.maxTokens = options.maxTokens || 4000;
    this.temperature = options.temperature || 0.7;
  }

  async generate(prompt, options = {}) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: this.temperature,
        },
      });

      const fullPrompt = this.buildPrompt(prompt, options.conversationContext);
      const result = await model.generateContent(fullPrompt);
      const response = result.response;

      return {
        content: response.text(),
        provider: 'gemini',
        model: this.model,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini error: ${error.message}`);
    }
  }

  async *generateStream(prompt, options = {}) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: this.temperature,
        },
      });

      const fullPrompt = this.buildPrompt(prompt, options.conversationContext);
      const result = await model.generateContentStream(fullPrompt);

      for await (const chunk of result.stream) {
        const content = chunk.text();
        if (content) {
          yield { content, done: false };
        }
      }
      yield { done: true };
    } catch (error) {
      console.error('Gemini Stream Error:', error);
      yield { error: error.message, done: true };
    }
  }

  buildPrompt(prompt, conversationContext) {
    if (conversationContext && conversationContext.messages) {
      const history = conversationContext.messages
        .slice(-10)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');
      
      return `Previous conversation:\n${history}\n\nCurrent request:\n${prompt}`;
    }
    return prompt;
  }

  async healthCheck() {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      await model.generateContent('test');
      return true;
    } catch (error) {
      throw new Error(`Gemini health check failed: ${error.message}`);
    }
  }

  dispose() {
    // No cleanup needed
  }
}

export default GeminiProvider;
