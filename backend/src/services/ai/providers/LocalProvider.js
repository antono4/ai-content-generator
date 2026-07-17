/**
 * Local Provider - Integration with local models (Ollama, LM Studio, etc.)
 */

export class LocalProvider {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.LOCAL_MODEL_URL || 'http://localhost:11434';
    this.model = options.model || 'llama2';
    this.timeout = options.timeout || 60000;
  }

  async generate(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: this.buildPrompt(prompt, options.conversationContext),
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.maxTokens || 4000,
          },
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Local model error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: data.response,
        provider: 'local',
        model: this.model,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      console.error('Local Model Error:', error);
      throw new Error(`Local model error: ${error.message}`);
    }
  }

  async *generateStream(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: this.buildPrompt(prompt, options.conversationContext),
          stream: true,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.maxTokens || 4000,
          },
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        yield { error: `Local model error: ${response.status}`, done: true };
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                yield { content: data.response, done: false };
              }
              if (data.done) {
                yield { done: true };
                return;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Local Model Stream Error:', error);
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
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.models || !Array.isArray(data.models)) {
        throw new Error('Invalid response format');
      }

      return true;
    } catch (error) {
      throw new Error(`Local model health check failed: ${error.message}`);
    }
  }

  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to list local models:', error);
      return [];
    }
  }

  dispose() {
    // No cleanup needed
  }
}

export default LocalProvider;
