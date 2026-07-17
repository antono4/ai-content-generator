/**
 * Knowledge Graph API Routes
 */

import { Router } from 'express';
import { GraphService } from '../../services/knowledge/GraphService.js';

const router = Router();

// Initialize graph service
const graphService = new GraphService();

// Add a node
router.post('/add', async (req, res) => {
  try {
    const { type, label, content, metadata = {} } = req.body;

    if (!label && !content) {
      return res.status(400).json({
        success: false,
        error: 'Label or content is required',
      });
    }

    const node = graphService.addNode({
      type: type || 'default',
      label,
      content,
      metadata,
    });

    res.json({ success: true, node });
  } catch (error) {
    console.error('Knowledge Add Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get a node
router.get('/node/:id', async (req, res) => {
  try {
    const node = graphService.getNode(req.params.id);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found',
      });
    }

    res.json(node);
  } catch (error) {
    console.error('Knowledge Get Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update a node
router.put('/node/:id', async (req, res) => {
  try {
    const node = graphService.updateNode(req.params.id, req.body);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found',
      });
    }

    res.json({ success: true, node });
  } catch (error) {
    console.error('Knowledge Update Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete a node
router.delete('/node/:id', async (req, res) => {
  try {
    const deleted = graphService.deleteNode(req.params.id);
    
    res.json({ success: deleted });
  } catch (error) {
    console.error('Knowledge Delete Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add edge
router.post('/connect', async (req, res) => {
  try {
    const { source, target, type = 'default', weight = 1, metadata = {} } = req.body;

    const edge = graphService.addEdge(source, target, type, weight, metadata);
    
    res.json({ success: true, edge });
  } catch (error) {
    console.error('Knowledge Connect Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete edge
router.delete('/edge/:id', async (req, res) => {
  try {
    const deleted = graphService.deleteEdge(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    console.error('Knowledge Edge Delete Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Search
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 10, type = null } = req.body;

    const results = await graphService.search(query, { limit, type });
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('Knowledge Search Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get connected nodes
router.get('/connected/:id', async (req, res) => {
  try {
    const connected = graphService.getConnectedNodes(req.params.id);
    res.json({ success: true, connected });
  } catch (error) {
    console.error('Knowledge Connected Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get subgraph
router.get('/subgraph/:id', async (req, res) => {
  try {
    const { radius = 2 } = req.query;
    const subgraph = graphService.getSubgraph(req.params.id, parseInt(radius));
    res.json({ success: true, subgraph });
  } catch (error) {
    console.error('Knowledge Subgraph Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get all nodes
router.get('/nodes', async (req, res) => {
  try {
    const { type } = req.query;
    
    let nodes;
    if (type) {
      nodes = graphService.getNodesByType(type);
    } else {
      nodes = graphService.getAllNodes();
    }

    res.json({ success: true, nodes });
  } catch (error) {
    console.error('Knowledge Nodes Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const stats = graphService.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Knowledge Stats Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Export graph
router.get('/export', async (req, res) => {
  try {
    const data = graphService.export();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Knowledge Export Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Import graph
router.post('/import', async (req, res) => {
  try {
    const { data } = req.body;
    graphService.import(data);
    res.json({ success: true });
  } catch (error) {
    console.error('Knowledge Import Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Clear graph
router.post('/clear', async (req, res) => {
  try {
    graphService.clear();
    res.json({ success: true });
  } catch (error) {
    console.error('Knowledge Clear Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { router as knowledgeRouter };
