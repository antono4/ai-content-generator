/**
 * OpenAI Provider - Integration with OpenAI GPT models
 */

import OpenAI from 'openai';

export class OpenAIProvider {
  constructor(options = {}) {
    this.client = options.apiKey 
      ? new OpenAI({ apiKey: options.apiKey })
      : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    this.model = options.model || 'gpt-4-turbo-preview';
    this.maxTokens = options.maxTokens || 4000;
    this.temperature = options.temperature || 0.7;
  }

  async generate(prompt, options = {}) {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: this.buildMessages(prompt, options.conversationContext),
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature,
      });

      const choice = completion.choices[0];
      
      return {
        content: choice.message.content,
        provider: 'openai',
        model: this.model,
        usage: {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI error: ${error.message}`);
    }
  }

  async *generateStream(prompt, options = {}) {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: this.buildMessages(prompt, options.conversationContext),
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield { content, done: false };
        }
        if (chunk.choices[0]?.finish_reason) {
          yield { done: true };
        }
      }
    } catch (error) {
      console.error('OpenAI Stream Error:', error);
      yield { error: error.message, done: true };
    }
  }

  buildMessages(prompt, conversationContext) {
    const messages = [];

    // Add conversation history if available
    if (conversationContext && conversationContext.messages) {
      const recentMessages = conversationContext.messages.slice(-20);
      for (const msg of recentMessages) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt,
    });

    return messages;
  }

  async healthCheck() {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      throw new Error(`OpenAI health check failed: ${error.message}`);
    }
  }

  dispose() {
    // No cleanup needed for OpenAI client
  }
}

export default OpenAIProvider;
