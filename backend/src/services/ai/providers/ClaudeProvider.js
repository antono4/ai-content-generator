/**
 * Claude Provider - Integration with Anthropic Claude
 */

import Anthropic from '@anthropic-ai/sdk';

export class ClaudeProvider {
  constructor(options = {}) {
    this.client = options.apiKey
      ? new Anthropic({ apiKey: options.apiKey })
      : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    this.model = options.model || 'claude-3-opus-20240229';
    this.maxTokens = options.maxTokens || 4000;
    this.temperature = options.temperature || 0.7;
  }

  async generate(prompt, options = {}) {
    try {
      const messages = this.buildMessages(prompt, options.conversationContext);
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages,
      });

      return {
        content: response.content[0].text,
        provider: 'claude',
        model: this.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Claude error: ${error.message}`);
    }
  }

  async *generateStream(prompt, options = {}) {
    try {
      const messages = this.buildMessages(prompt, options.conversationContext);
      
      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          yield { content: chunk.delta.text, done: false };
        }
        if (chunk.type === 'message_stop') {
          yield { done: true };
        }
      }
    } catch (error) {
      console.error('Claude Stream Error:', error);
      yield { error: error.message, done: true };
    }
  }

  buildMessages(prompt, conversationContext) {
    const messages = [];

    // Add conversation history
    if (conversationContext && conversationContext.messages) {
      const recentMessages = conversationContext.messages.slice(-20);
      for (const msg of recentMessages) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
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
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      throw new Error(`Claude health check failed: ${error.message}`);
    }
  }

  dispose() {
    // No cleanup needed
  }
}

export default ClaudeProvider;
