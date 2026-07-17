/**
 * AI Kernel Store - State management for AI operations
 */

import { create } from 'zustand';

export const useAIKernelStore = create((set, get) => ({
  // Connection state
  isConnected: false,
  isProcessing: false,
  error: null,
  
  // Model state
  currentProvider: 'openai',
  availableProviders: ['openai', 'gemini', 'claude'],
  providerStatus: {
    openai: 'unknown',
    gemini: 'unknown',
    claude: 'unknown',
  },
  
  // Conversation state
  conversations: {},
  activeConversationId: null,
  
  // Intent history
  intentHistory: [],
  
  // Actions
  setConnected: (connected) => set({ isConnected: connected }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  setCurrentProvider: (provider) => set({ currentProvider: provider }),
  
  updateProviderStatus: (provider, status) => set((state) => ({
    providerStatus: {
      ...state.providerStatus,
      [provider]: status,
    },
  })),
  
  // Conversation management
  createConversation: (id, title) => set((state) => ({
    conversations: {
      ...state.conversations,
      [id]: {
        id,
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    },
    activeConversationId: id,
  })),
  
  setActiveConversation: (id) => set({ activeConversationId: id }),
  
  addMessage: (conversationId, message) => set((state) => {
    const conversation = state.conversations[conversationId];
    if (!conversation) return state;
    
    return {
      conversations: {
        ...state.conversations,
        [conversationId]: {
          ...conversation,
          messages: [...conversation.messages, message],
          updatedAt: Date.now(),
        },
      },
    };
  }),
  
  getActiveConversation: () => {
    const state = get();
    return state.conversations[state.activeConversationId];
  },
  
  // Intent tracking
  addIntent: (intent) => set((state) => ({
    intentHistory: [
      ...state.intentHistory,
      { ...intent, timestamp: Date.now() },
    ].slice(-100), // Keep last 100
  })),
  
  clearIntentHistory: () => set({ intentHistory: [] }),
  
  // Reset
  reset: () => set({
    isConnected: false,
    isProcessing: false,
    error: null,
    currentProvider: 'openai',
    conversations: {},
    activeConversationId: null,
    intentHistory: [],
  }),
}));

export default useAIKernelStore;
