/**
 * AI Kernel - Orchestrates AI operations across multiple providers
 */

import { ModelRouter } from './ModelRouter.js';
import { ContextManager } from './ContextManager.js';
import { ResponseSynthesizer } from './ResponseSynthesizer.js';

export class AIKernel {
  constructor(options = {}) {
    this.router = new ModelRouter(options.providers);
    this.contextManager = new ContextManager({
      maxHistory: options.maxHistory || 50,
      maxTokens: options.maxTokens || 4000,
    });
    this.synthesizer = new ResponseSynthesizer();
    this.sessionId = options.sessionId;
    this.fallbackChain = options.fallbackChain || ['openai', 'gemini', 'claude'];
  }

  async process(intent, context = {}) {
    const startTime = Date.now();
    let lastError = null;

    // Get available models sorted by priority
    const availableModels = this.router.getAvailableModels();
    
    if (availableModels.length === 0) {
      return {
        success: false,
        error: 'No AI providers available',
        response: null,
      };
    }

    // Try each model in order
    for (const provider of availableModels) {
      try {
        // Get conversation context
        const conversationContext = this.contextManager.getContext(this.sessionId);
        
        // Build full prompt with context
        const fullPrompt = this.buildPrompt(intent, conversationContext, context);
        
        // Generate response
        const response = await this.router.generate(provider, fullPrompt, {
          conversationContext,
          intent,
        });
        
        // Track successful response
        this.contextManager.addMessage(this.sessionId, {
          role: 'user',
          content: intent,
        });
        this.contextManager.addMessage(this.sessionId, {
          role: 'assistant',
          content: response.content,
          metadata: {
            provider: response.provider,
            model: response.model,
            tokens: response.usage,
          },
        });

        // Synthesize structured response
        const synthesized = await this.synthesizer.synthesize(response.content, context);

        return {
          success: true,
          response: response.content,
          structured: synthesized,
          metadata: {
            provider: response.provider,
            model: response.model,
            latency: Date.now() - startTime,
            tokens: response.usage,
          },
        };
      } catch (error) {
        console.error(`AI Kernel error with ${provider}:`, error.message);
        lastError = error;
        this.router.markProviderError(provider);
      }
    }

    // All providers failed
    return {
      success: false,
      error: lastError?.message || 'All AI providers failed',
      response: null,
    };
  }

  buildPrompt(intent, context, additionalContext = {}) {
    const systemPrompt = this.getSystemPrompt();
    const conversationHistory = this.formatHistory(context);
    const contextInfo = this.formatContext(additionalContext);

    return `
${systemPrompt}

${conversationHistory}

${contextInfo}

Current Intent: ${intent}
`;
  }

  getSystemPrompt() {
    return `You are the AI Kernel of AetherOS, a next-generation cognitive spatial operating system.

Your capabilities:
1. Understanding user intent and generating appropriate responses
2. Creating dynamic micro-applications based on user needs
3. Managing knowledge and creating semantic connections
4. Executing system commands and managing resources
5. Reasoning about complex multi-step tasks

When responding:
- Be concise but comprehensive
- Use structured output when helpful (JSON format)
- Suggest relevant actions when appropriate
- Connect related concepts and information
- Prioritize safety and user privacy

Available actions you can take:
- create_app: Generate a new micro-application
- search_knowledge: Search the knowledge graph
- add_knowledge: Add information to the knowledge graph
- execute_command: Run a system command
- analyze_data: Analyze provided data
- generate_code: Generate code for a specific purpose`;
  }

  formatHistory(context) {
    if (!context || !context.messages || context.messages.length === 0) {
      return 'No previous conversation history.';
    }

    const recentMessages = context.messages.slice(-10);
    return `Conversation History:\n${recentMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n')}`;
  }

  formatContext(additionalContext) {
    if (!additionalContext || Object.keys(additionalContext).length === 0) {
      return '';
    }

    return `Additional Context:\n${JSON.stringify(additionalContext, null, 2)}`;
  }

  // Stream processing for real-time responses
  async *processStream(intent, context = {}) {
    const availableModels = this.router.getAvailableModels();
    
    for (const provider of availableModels) {
      try {
        const conversationContext = this.contextManager.getContext(this.sessionId);
        const fullPrompt = this.buildPrompt(intent, conversationContext, context);

        for await (const chunk of this.router.generateStream(provider, fullPrompt)) {
          yield chunk;
        }
        
        return; // Successfully streamed
      } catch (error) {
        console.error(`Stream error with ${provider}:`, error.message);
        this.router.markProviderError(provider);
      }
    }

    yield { error: 'All providers failed' };
  }

  getStatus() {
    return {
      providers: this.router.getProviderStatus(),
      contextSize: this.contextManager.getContextSize(this.sessionId),
      sessionId: this.sessionId,
    };
  }

  resetContext() {
    this.contextManager.clearSession(this.sessionId);
  }
}

export default AIKernel;
