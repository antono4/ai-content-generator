/**
 * GraphService - Manages the knowledge graph
 */

import { v4 as uuidv4 } from 'uuid';

export class GraphService {
  constructor(options = {}) {
    this.nodes = new Map();
    this.edges = new Map();
    this.index = new Map(); // nodeId -> Set of connected edgeIds
    this.typeIndex = new Map(); // type -> Set of nodeIds
    this.vectorStore = options.vectorStore || null;
  }

  // Node operations
  addNode(node) {
    const id = node.id || uuidv4();
    const fullNode = {
      id,
      type: node.type || 'default',
      label: node.label || '',
      content: node.content || '',
      metadata: node.metadata || {},
      embedding: node.embedding || null,
      createdAt: node.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    this.nodes.set(id, fullNode);

    // Index by type
    if (!this.typeIndex.has(fullNode.type)) {
      this.typeIndex.set(fullNode.type, new Set());
    }
    this.typeIndex.get(fullNode.type).add(id);

    // Index in vector store if available
    if (this.vectorStore && fullNode.embedding) {
      this.vectorStore.upsert('nodes', {
        id,
        values: fullNode.embedding,
        metadata: { type: fullNode.type, label: fullNode.label },
      });
    }

    return fullNode;
  }

  getNode(id) {
    return this.nodes.get(id) || null;
  }

  updateNode(id, updates) {
    const node = this.nodes.get(id);
    if (!node) return null;

    const updatedNode = {
      ...node,
      ...updates,
      id: node.id, // Prevent ID change
      updatedAt: Date.now(),
    };

    this.nodes.set(id, updatedNode);

    // Update vector store if embedding changed
    if (this.vectorStore && updatedNode.embedding) {
      this.vectorStore.upsert('nodes', {
        id,
        values: updatedNode.embedding,
        metadata: { type: updatedNode.type, label: updatedNode.label },
      });
    }

    return updatedNode;
  }

  deleteNode(id) {
    const node = this.nodes.get(id);
    if (!node) return false;

    // Remove from type index
    const typeSet = this.typeIndex.get(node.type);
    if (typeSet) {
      typeSet.delete(id);
    }

    // Remove connected edges
    const connectedEdges = this.index.get(id);
    if (connectedEdges) {
      for (const edgeId of connectedEdges) {
        const edge = this.edges.get(edgeId);
        if (edge) {
          const otherIndex = this.index.get(edge.source === id ? edge.target : edge.source);
          if (otherIndex) {
            otherIndex.delete(edgeId);
          }
          this.edges.delete(edgeId);
        }
      }
      this.index.delete(id);
    }

    // Remove from vector store
    if (this.vectorStore) {
      this.vectorStore.delete('nodes', id);
    }

    this.nodes.delete(id);
    return true;
  }

  getNodesByType(type) {
    const ids = this.typeIndex.get(type);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.nodes.get(id)).filter(Boolean);
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  // Edge operations
  addEdge(source, target, type = 'default', weight = 1, metadata = {}) {
    // Validate nodes exist
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      throw new Error('Source or target node not found');
    }

    const id = `${source}-${target}`;
    
    // Don't add duplicate edges
    if (this.edges.has(id)) {
      return this.edges.get(id);
    }

    const edge = {
      id,
      source,
      target,
      type,
      weight,
      metadata,
      createdAt: Date.now(),
    };

    this.edges.set(id, edge);

    // Update indexes
    this.updateEdgeIndex(source, id);
    this.updateEdgeIndex(target, id);

    return edge;
  }

  updateEdgeIndex(nodeId, edgeId) {
    if (!this.index.has(nodeId)) {
      this.index.set(nodeId, new Set());
    }
    this.index.get(nodeId).add(edgeId);
  }

  getEdge(id) {
    return this.edges.get(id) || null;
  }

  deleteEdge(id) {
    const edge = this.edges.get(id);
    if (!edge) return false;

    // Remove from node indexes
    const sourceIndex = this.index.get(edge.source);
    const targetIndex = this.index.get(edge.target);
    
    if (sourceIndex) sourceIndex.delete(id);
    if (targetIndex) targetIndex.delete(id);

    this.edges.delete(id);
    return true;
  }

  getConnectedNodes(nodeId) {
    const edgeIds = this.index.get(nodeId);
    if (!edgeIds) return [];

    const connected = [];
    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (edge) {
        const otherId = edge.source === nodeId ? edge.target : edge.source;
        const node = this.nodes.get(otherId);
        if (node) {
          connected.push({ node, edge });
        }
      }
    }

    return connected;
  }

  getEdgesByType(type) {
    return Array.from(this.edges.values()).filter((e) => e.type === type);
  }

  // Search operations
  async search(query, options = {}) {
    const { limit = 10, type = null } = options;

    // If vector store available, use semantic search
    if (this.vectorStore) {
      const results = await this.vectorStore.query('nodes', {
        query,
        topK: limit,
        filter: type ? { type } : undefined,
      });
      return results.map((r) => ({
        node: this.nodes.get(r.id),
        score: r.score,
      })).filter((r) => r.node);
    }

    // Fallback to keyword search
    const queryLower = query.toLowerCase();
    const results = [];

    for (const node of this.nodes.values()) {
      if (type && node.type !== type) continue;

      const matches =
        node.label.toLowerCase().includes(queryLower) ||
        node.content.toLowerCase().includes(queryLower);

      if (matches) {
        results.push({ node, score: 1 });
      }
    }

    return results.slice(0, limit);
  }

  // Graph traversal
  traverse(startId, depth = 2, direction = 'both') {
    const visited = new Set();
    const results = [];
    const queue = [{ id: startId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth: currentDepth } = queue.shift();

      if (visited.has(id) || currentDepth > depth) continue;
      visited.add(id);

      const node = this.nodes.get(id);
      if (node) {
        results.push({ node, depth: currentDepth });
      }

      if (currentDepth < depth) {
        const connected = this.getConnectedNodes(id);
        for (const { node: connectedNode, edge } of connected) {
          if (!visited.has(connectedNode.id)) {
            queue.push({ id: connectedNode.id, depth: currentDepth + 1 });
          }
        }
      }
    }

    return results;
  }

  // Get subgraph centered on a node
  getSubgraph(centerId, radius = 2) {
    const nodes = this.traverse(centerId, radius);
    const nodeIds = new Set(nodes.map((n) => n.node.id));

    const edges = Array.from(this.edges.values()).filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    return {
      nodes: nodes.map((n) => n.node),
      edges,
      centerId,
    };
  }

  // Serialization
  export() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      exportedAt: Date.now(),
    };
  }

  import(data) {
    this.clear();

    for (const node of data.nodes) {
      this.nodes.set(node.id, node);
      
      if (!this.typeIndex.has(node.type)) {
        this.typeIndex.set(node.type, new Set());
      }
      this.typeIndex.get(node.type).add(node.id);
    }

    for (const edge of data.edges) {
      this.edges.set(edge.id, edge);
      this.updateEdgeIndex(edge.source, edge.id);
      this.updateEdgeIndex(edge.target, edge.id);
    }
  }

  clear() {
    this.nodes.clear();
    this.edges.clear();
    this.index.clear();
    this.typeIndex.clear();
  }

  getStats() {
    const nodeTypes = {};
    for (const [type, ids] of this.typeIndex) {
      nodeTypes[type] = ids.size;
    }

    const edgeTypes = {};
    for (const edge of this.edges.values()) {
      edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
    }

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      nodeTypes,
      edgeTypes,
    };
  }
}

export default GraphService;
