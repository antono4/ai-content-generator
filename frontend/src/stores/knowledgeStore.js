/**
 * Knowledge Store - State management for knowledge graph
 */

import { create } from 'zustand';

export const useKnowledgeStore = create((set, get) => ({
  // Graph data
  nodes: new Map(),
  edges: [],
  
  // Search state
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  
  // Cache
  embeddingCache: new Map(),
  
  // Actions
  addNode: (node) => set((state) => {
    const newNodes = new Map(state.nodes);
    newNodes.set(node.id, node);
    return { nodes: newNodes };
  }),
  
  updateNode: (id, updates) => set((state) => {
    const node = state.nodes.get(id);
    if (!node) return state;
    
    const newNodes = new Map(state.nodes);
    newNodes.set(id, { ...node, ...updates });
    return { nodes: newNodes };
  }),
  
  removeNode: (id) => set((state) => {
    const newNodes = new Map(state.nodes);
    newNodes.delete(id);
    
    // Remove connected edges
    const newEdges = state.edges.filter(
      (edge) => edge.source !== id && edge.target !== id
    );
    
    return { nodes: newNodes, edges: newEdges };
  }),
  
  addEdge: (source, target, type = 'default', weight = 1) => set((state) => {
    // Check if edge already exists
    const exists = state.edges.some(
      (e) => e.source === source && e.target === target
    );
    if (exists) return state;
    
    return {
      edges: [
        ...state.edges,
        { id: `${source}-${target}`, source, target, type, weight },
      ],
    };
  }),
  
  removeEdge: (id) => set((state) => ({
    edges: state.edges.filter((e) => e.id !== id),
  })),
  
  // Batch operations
  addNodes: (nodes) => set((state) => {
    const newNodes = new Map(state.nodes);
    nodes.forEach((node) => newNodes.set(node.id, node));
    return { nodes: newNodes };
  }),
  
  addEdges: (edges) => set((state) => ({
    edges: [...state.edges, ...edges],
  })),
  
  // Search
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSearchResults: (results) => set({ 
    searchResults: results,
    isSearching: false,
  }),
  
  startSearch: () => set({ isSearching: true }),
  
  clearSearch: () => set({
    searchQuery: '',
    searchResults: [],
    isSearching: false,
  }),
  
  // Graph traversal
  getConnectedNodes: (nodeId) => {
    const state = get();
    return state.edges
      .filter((e) => e.source === nodeId || e.target === nodeId)
      .map((e) => {
        const otherId = e.source === nodeId ? e.target : e.source;
        return state.nodes.get(otherId);
      })
      .filter(Boolean);
  },
  
  getNodeByType: (type) => {
    const state = get();
    const result = [];
    state.nodes.forEach((node) => {
      if (node.type === type) result.push(node);
    });
    return result;
  },
  
  // Clear all
  clearGraph: () => set({
    nodes: new Map(),
    edges: [],
    searchQuery: '',
    searchResults: [],
  }),
  
  // Serialization
  exportGraph: () => {
    const state = get();
    return {
      nodes: Array.from(state.nodes.values()),
      edges: state.edges,
    };
  },
  
  importGraph: (data) => set({
    nodes: new Map(data.nodes.map((n) => [n.id, n])),
    edges: data.edges,
  }),
}));

export default useKnowledgeStore;
