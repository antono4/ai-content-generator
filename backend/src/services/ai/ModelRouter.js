/**
 * ModelRouter - Manages multiple AI providers with automatic failover
 */

import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { ClaudeProvider } from './providers/ClaudeProvider.js';
import { LocalProvider } from './providers/LocalProvider.js';

export class ModelRouter {
  constructor(providers = {}) {
    this.providers = new Map();
    this.providerStatus = new Map();
    
    // Initialize providers
    this.registerProvider('openai', new OpenAIProvider(providers.openai));
    this.registerProvider('gemini', new GeminiProvider(providers.gemini));
    this.registerProvider('claude', new ClaudeProvider(providers.claude));
    this.registerProvider('local', new LocalProvider(providers.local));
    
    // Default priorities
    this.priority = ['openai', 'gemini', 'claude', 'local'];
  }

  registerProvider(name, provider) {
    this.providers.set(name, provider);
    this.providerStatus.set(name, {
      name,
      status: 'unknown',
      lastError: null,
      errorCount: 0,
      lastSuccess: null,
    });
  }

  async checkProvider(name) {
    const provider = this.providers.get(name);
    if (!provider) return false;

    try {
      await provider.healthCheck();
      this.updateStatus(name, 'connected');
      return true;
    } catch (error) {
      this.updateStatus(name, 'error', error.message);
      return false;
    }
  }

  async checkAllProviders() {
    const results = {};
    for (const [name] of this.providers) {
      results[name] = await this.checkProvider(name);
    }
    return results;
  }

  updateStatus(name, status, error = null) {
    const current = this.providerStatus.get(name);
    if (!current) return;

    this.providerStatus.set(name, {
      ...current,
      status,
      lastError: error,
      errorCount: status === 'error' ? current.errorCount + 1 : 0,
      lastSuccess: status === 'connected' ? Date.now() : current.lastSuccess,
    });
  }

  markProviderError(name) {
    const current = this.providerStatus.get(name);
    if (!current) return;

    this.providerStatus.set(name, {
      ...current,
      status: 'error',
      errorCount: current.errorCount + 1,
      lastError: new Date().toISOString(),
    });
  }

  getAvailableModels() {
    // Return providers sorted by priority, excluding errored ones
    return this.priority.filter((name) => {
      const status = this.providerStatus.get(name);
      // Skip if too many consecutive errors
      if (status && status.errorCount >= 3) return false;
      // Skip if currently errored (with some tolerance)
      if (status && status.status === 'error') return false;
      return this.providers.has(name);
    });
  }

  getProviderStatus() {
    const status = {};
    for (const [name, info] of this.providerStatus) {
      status[name] = {
        status: info.status,
        errorCount: info.errorCount,
        lastError: info.lastError,
        lastSuccess: info.lastSuccess,
      };
    }
    return status;
  }

  async generate(providerName, prompt, options = {}) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    return await provider.generate(prompt, options);
  }

  async *generateStream(providerName, prompt, options = {}) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    if (typeof provider.generateStream === 'function') {
      yield* provider.generateStream(prompt, options);
    } else {
      // Fallback to regular generate
      const response = await provider.generate(prompt, options);
      yield { content: response.content, done: true };
    }
  }

  // Select best provider based on task type
  selectProviderForTask(taskType) {
    const providerMap = {
      'code': ['openai', 'claude'],
      'creative': ['openai', 'claude', 'gemini'],
      'analysis': ['claude', 'openai', 'gemini'],
      'fast': ['openai', 'gemini'],
      'reasoning': ['claude', 'gemini'],
      'default': this.getAvailableModels(),
    };

    const preferred = providerMap[taskType] || providerMap['default'];
    return preferred.find((p) => this.getAvailableModels().includes(p)) || this.getAvailableModels()[0];
  }

  dispose() {
    for (const [name, provider] of this.providers) {
      if (typeof provider.dispose === 'function') {
        provider.dispose();
      }
    }
    this.providers.clear();
  }
}

export default ModelRouter;
