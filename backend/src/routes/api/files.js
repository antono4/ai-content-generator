/**
 * Files API Routes - Fluid File System abstraction over knowledge graph
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory file storage (in production, use vector database)
const fileStore = new Map();

// Create a file/entry
router.post('/', async (req, res) => {
  try {
    const { name, content, type = 'text', tags = [], metadata = {} } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }

    const file = {
      id: uuidv4(),
      name,
      content: content || '',
      type,
      tags,
      metadata,
      connections: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    fileStore.set(file.id, file);

    res.json({ success: true, file });
  } catch (error) {
    console.error('File Create Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// List all files
router.get('/', async (req, res) => {
  try {
    const { type, tag, search } = req.query;
    let files = Array.from(fileStore.values());

    // Filter by type
    if (type) {
      files = files.filter((f) => f.type === type);
    }

    // Filter by tag
    if (tag) {
      files = files.filter((f) => f.tags.includes(tag));
    }

    // Search by name
    if (search) {
      const searchLower = search.toLowerCase();
      files = files.filter((f) =>
        f.name.toLowerCase().includes(searchLower) ||
        f.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort by updated time
    files.sort((a, b) => b.updatedAt - a.updatedAt);

    res.json({ success: true, files });
  } catch (error) {
    console.error('File List Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get a file
router.get('/:id', async (req, res) => {
  try {
    const file = fileStore.get(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    res.json({ success: true, file });
  } catch (error) {
    console.error('File Get Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update a file
router.put('/:id', async (req, res) => {
  try {
    const file = fileStore.get(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    const { name, content, type, tags, metadata } = req.body;
    
    const updatedFile = {
      ...file,
      name: name !== undefined ? name : file.name,
      content: content !== undefined ? content : file.content,
      type: type !== undefined ? type : file.type,
      tags: tags !== undefined ? tags : file.tags,
      metadata: metadata !== undefined ? { ...file.metadata, ...metadata } : file.metadata,
      updatedAt: Date.now(),
    };

    fileStore.set(req.params.id, updatedFile);

    res.json({ success: true, file: updatedFile });
  } catch (error) {
    console.error('File Update Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete a file
router.delete('/:id', async (req, res) => {
  try {
    const deleted = fileStore.delete(req.params.id);
    
    res.json({ success: deleted });
  } catch (error) {
    console.error('File Delete Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Connect files (create relationship)
router.post('/:id/connect/:targetId', async (req, res) => {
  try {
    const file = fileStore.get(req.params.id);
    const target = fileStore.get(req.params.targetId);
    
    if (!file || !target) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    if (!file.connections.includes(req.params.targetId)) {
      file.connections.push(req.params.targetId);
      fileStore.set(req.params.id, file);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('File Connect Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get connected files
router.get('/:id/connections', async (req, res) => {
  try {
    const file = fileStore.get(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    const connected = file.connections
      .map((id) => fileStore.get(id))
      .filter(Boolean);

    res.json({ success: true, connected });
  } catch (error) {
    console.error('File Connections Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Semantic search
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const queryLower = query.toLowerCase();
    const files = Array.from(fileStore.values());
    
    // Score files by relevance
    const scored = files.map((file) => {
      let score = 0;
      
      // Name match (highest weight)
      if (file.name.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Tag match
      if (file.tags.some((tag) => tag.toLowerCase().includes(queryLower))) {
        score += 5;
      }
      
      // Content match
      if (file.content.toLowerCase().includes(queryLower)) {
        score += 3;
      }
      
      return { file, score };
    });

    // Sort by score and limit
    const results = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.file);

    res.json({ success: true, results });
  } catch (error) {
    console.error('File Search Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get all tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = new Set();
    
    for (const file of fileStore.values()) {
      file.tags.forEach((tag) => tags.add(tag));
    }

    res.json({ success: true, tags: Array.from(tags) });
  } catch (error) {
    console.error('Tags List Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get file stats
router.get('/meta/stats', async (req, res) => {
  try {
    const files = Array.from(fileStore.values());
    
    const stats = {
      total: files.length,
      byType: {},
      byTag: {},
    };

    for (const file of files) {
      stats.byType[file.type] = (stats.byType[file.type] || 0) + 1;
      
      for (const tag of file.tags) {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      }
    }

    res.json({ success: true, stats });
  } catch (error) {
    console.error('File Stats Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { router as filesRouter };
