/**
 * Apps API Routes - Dynamic micro-app generation
 */

import { Router } from 'express';
import { ComponentGenerator } from '../../services/generator/ComponentGenerator.js';
import { AIKernel } from '../../services/ai/Kernel.js';

const router = Router();

// Initialize generator
const aiKernel = new AIKernel({
  providers: {
    openai: { apiKey: process.env.OPENAI_API_KEY },
    gemini: { apiKey: process.env.GEMINI_API_KEY },
    claude: { apiKey: process.env.ANTHROPIC_API_KEY },
  },
});

const generator = new ComponentGenerator({ aiKernel });

// Cache for generated apps
const appCache = new Map();

// Generate a new app
router.post('/generate', async (req, res) => {
  try {
    const { description, requirements = [], context = {} } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required',
      });
    }

    const app = await generator.generate(description, requirements, context);
    
    // Cache the app
    appCache.set(app.id, app);

    res.json({
      success: true,
      app: {
        id: app.id,
        name: app.name,
        type: app.type,
        metadata: app.metadata,
      },
    });
  } catch (error) {
    console.error('App Generation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get full app with code
router.get('/:id', async (req, res) => {
  try {
    const app = appCache.get(req.params.id);
    
    if (!app) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      });
    }

    res.json({ success: true, app });
  } catch (error) {
    console.error('App Get Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get preset components
router.get('/presets/:type', async (req, res) => {
  try {
    const preset = generator.generatePreset(req.params.type);
    
    if (!preset) {
      return res.status(404).json({
        success: false,
        error: 'Preset not found',
      });
    }

    res.json({ success: true, preset });
  } catch (error) {
    console.error('Preset Get Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// List available presets
router.get('/presets', async (req, res) => {
  try {
    const presets = ['button', 'card', 'form', 'list', 'modal'];
    res.json({ success: true, presets });
  } catch (error) {
    console.error('Presets List Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get HTML for rendering
router.get('/:id/html', async (req, res) => {
  try {
    const app = appCache.get(req.params.id);
    
    if (!app) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      });
    }

    const { SandboxRunner } = await import('../../services/generator/SandboxRunner.js');
    const runner = new SandboxRunner();
    const html = runner.generateHTML(app, app.styles);

    res.json({ success: true, html });
  } catch (error) {
    console.error('App HTML Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Validate app code
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    const { SandboxRunner } = await import('../../services/generator/SandboxRunner.js');
    const runner = new SandboxRunner();
    const validation = runner.validate(code);

    res.json({ success: true, validation });
  } catch (error) {
    console.error('App Validate Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Execute app code
router.post('/execute', async (req, res) => {
  try {
    const { code, context = {} } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    const { SandboxRunner } = await import('../../services/generator/SandboxRunner.js');
    const runner = new SandboxRunner();
    const result = await runner.execute(code, context);

    res.json(result);
  } catch (error) {
    console.error('App Execute Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// List cached apps
router.get('/', async (req, res) => {
  try {
    const apps = Array.from(appCache.values()).map((app) => ({
      id: app.id,
      name: app.name,
      type: app.type,
      createdAt: app.createdAt,
    }));

    res.json({ success: true, apps });
  } catch (error) {
    console.error('Apps List Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete cached app
router.delete('/:id', async (req, res) => {
  try {
    const deleted = appCache.delete(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    console.error('App Delete Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Clear app cache
router.post('/clear', async (req, res) => {
  try {
    appCache.clear();
    res.json({ success: true });
  } catch (error) {
    console.error('App Clear Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { router as appsRouter };
