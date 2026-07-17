/**
 * ContextManager - Manages conversation context and history
 */

export class ContextManager {
  constructor(options = {}) {
    this.maxHistory = options.maxHistory || 50;
    this.maxTokens = options.maxTokens || 4000;
    this.sessions = new Map();
  }

  getContext(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        messages: [],
        metadata: {},
        createdAt: Date.now(),
      });
    }
    return this.sessions.get(sessionId);
  }

  addMessage(sessionId, message) {
    const session = this.getContext(sessionId);
    session.messages.push({
      ...message,
      timestamp: Date.now(),
    });

    // Trim if exceeds max history
    if (session.messages.length > this.maxHistory) {
      session.messages = session.messages.slice(-this.maxHistory);
    }

    return session;
  }

  getMessages(sessionId, limit = null) {
    const session = this.getContext(sessionId);
    if (limit) {
      return session.messages.slice(-limit);
    }
    return session.messages;
  }

  getLastMessage(sessionId) {
    const messages = this.getMessages(sessionId);
    return messages[messages.length - 1] || null;
  }

  clearSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
    }
  }

  getContextSize(sessionId) {
    const session = this.getContext(sessionId);
    return this.estimateTokens(session.messages);
  }

  estimateTokens(messages) {
    // Rough estimate: ~4 characters per token
    const totalChars = messages.reduce((sum, msg) => {
      return sum + (msg.content?.length || 0);
    }, 0);
    return Math.ceil(totalChars / 4);
  }

  summarizeContext(sessionId) {
    const session = this.getContext(sessionId);
    if (session.messages.length <= 10) {
      return session.messages;
    }

    // Keep first message (system) and last N messages
    const systemMessage = session.messages.find((m) => m.role === 'system');
    const recentMessages = session.messages.slice(-10);

    if (systemMessage) {
      return [systemMessage, ...recentMessages];
    }
    return recentMessages;
  }

  addMetadata(sessionId, key, value) {
    const session = this.getContext(sessionId);
    session.metadata[key] = value;
  }

  getMetadata(sessionId, key) {
    const session = this.getContext(sessionId);
    return session.metadata[key];
  }

  getAllSessions() {
    return Array.from(this.sessions.keys());
  }

  getSessionInfo(sessionId) {
    const session = this.getContext(sessionId);
    return {
      messageCount: session.messages.length,
      tokenEstimate: this.estimateTokens(session.messages),
      createdAt: session.createdAt,
      metadata: session.metadata,
    };
  }

  // Merge context from multiple sessions
  mergeContexts(sessionIds) {
    const allMessages = [];
    const seen = new Set();

    for (const sessionId of sessionIds) {
      const messages = this.getMessages(sessionId);
      for (const msg of messages) {
        const key = `${msg.timestamp}-${msg.content}`;
        if (!seen.has(key)) {
          seen.add(key);
          allMessages.push(msg);
        }
      }
    }

    // Sort by timestamp
    allMessages.sort((a, b) => a.timestamp - b.timestamp);

    // Trim to max tokens
    while (this.estimateTokens(allMessages) > this.maxTokens && allMessages.length > 1) {
      allMessages.shift();
    }

    return allMessages;
  }
}

export default ContextManager;
