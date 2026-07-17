/**
 * ResponseSynthesizer - Parses and structures AI responses
 */

export class ResponseSynthesizer {
  constructor() {
    this.actionPatterns = {
      create_app: /create_app\s*:\s*({[\s\S]*?})/i,
      search_knowledge: /search_knowledge\s*:\s*"([^"]+)"/i,
      add_knowledge: /add_knowledge\s*:\s*({[\s\S]*?})/i,
      execute_command: /execute_command\s*:\s*"([^"]+)"/i,
      analyze_data: /analyze_data\s*:\s*({[\s\S]*?})/i,
      generate_code: /generate_code\s*:\s*```[\s\S]*?```/i,
    };
  }

  async synthesize(content, context = {}) {
    const result = {
      text: '',
      actions: [],
      components: [],
      knowledgeUpdates: [],
      intent: null,
      confidence: 0,
    };

    // Try to parse as JSON first
    if (this.isJSON(content)) {
      try {
        const parsed = JSON.parse(content);
        return this.parseStructuredResponse(parsed, context);
      } catch (e) {
        // Not valid JSON, continue with text parsing
      }
    }

    // Parse structured patterns
    result.text = content;
    result.actions = this.extractActions(content);
    result.components = this.extractComponents(content);
    result.knowledgeUpdates = this.extractKnowledgeUpdates(content);
    result.intent = this.detectIntent(content);

    // Calculate confidence based on pattern matches
    let matches = 0;
    if (result.actions.length > 0) matches++;
    if (result.components.length > 0) matches++;
    if (result.knowledgeUpdates.length > 0) matches++;
    result.confidence = matches / 3;

    return result;
  }

  isJSON(str) {
    try {
      const parsed = JSON.parse(str);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }

  parseStructuredResponse(data, context) {
    return {
      text: data.text || data.response || data.message || '',
      actions: data.actions || [],
      components: data.components || [],
      knowledgeUpdates: data.knowledgeUpdates || [],
      intent: data.intent || this.detectIntent(data.text || ''),
      confidence: data.confidence || 0.9,
    };
  }

  extractActions(content) {
    const actions = [];
    
    for (const [actionType, pattern] of Object.entries(this.actionPatterns)) {
      const match = content.match(pattern);
      if (match) {
        try {
          const value = match[1];
          let parsed;
          
          if (value.startsWith('{')) {
            parsed = JSON.parse(value);
          } else {
            parsed = { query: value };
          }
          
          actions.push({
            type: actionType,
            params: parsed,
          });
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    return actions;
  }

  extractComponents(content) {
    const components = [];
    const codeBlockPattern = /```(?:jsx|html|css|react|javascript|js)\s*([\s\S]*?)```/g;
    
    let match;
    while ((match = codeBlockPattern.exec(content)) !== null) {
      const code = match[1].trim();
      const language = match[0].match(/```(\w+)/)[1];
      
      components.push({
        type: this.detectComponentType(code),
        code,
        language,
      });
    }

    return components;
  }

  detectComponentType(code) {
    if (code.includes('function') || code.includes('const') || code.includes('=>')) {
      return 'react';
    }
    if (code.includes('<div') || code.includes('<span') || code.includes('class=')) {
      return 'html';
    }
    if (code.includes('{') && code.includes(':')) {
      return 'style';
    }
    return 'unknown';
  }

  extractKnowledgeUpdates(content) {
    const updates = [];
    const knowledgePattern = /knowledge:\s*"([^"]+)"|add\s+to\s+knowledge:\s*([^\n]+)/gi;
    
    let match;
    while ((match = knowledgePattern.exec(content)) !== null) {
      updates.push({
        type: 'add',
        content: match[1] || match[2],
        timestamp: Date.now(),
      });
    }

    return updates;
  }

  detectIntent(content) {
    const lowerContent = content.toLowerCase();
    
    const intentPatterns = {
      create: ['create', 'build', 'make', 'generate', 'new'],
      read: ['show', 'display', 'list', 'get', 'fetch', 'retrieve'],
      update: ['update', 'edit', 'modify', 'change', 'alter'],
      delete: ['delete', 'remove', 'clear', 'drop'],
      search: ['search', 'find', 'look', 'query', 'filter'],
      analyze: ['analyze', 'review', 'examine', 'check', 'assess'],
      execute: ['run', 'execute', 'start', 'launch', 'do'],
    };

    for (const [intent, keywords] of Object.entries(intentPatterns)) {
      if (keywords.some((kw) => lowerContent.includes(kw))) {
        return intent;
      }
    }

    return 'unknown';
  }

  // Format response for specific use cases
  formatForDisplay(response) {
    return {
      ...response,
      formatted: this.formatMarkdown(response.text),
    };
  }

  formatMarkdown(text) {
    // Basic markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
}

export default ResponseSynthesizer;
