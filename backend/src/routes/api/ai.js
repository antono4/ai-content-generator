/**
 * AI API Routes
 */

import { Router } from 'express';
import { AIKernel } from '../../services/ai/Kernel.js';

const router = Router();

// Initialize kernel
const kernels = new Map();

function getKernel(sessionId) {
  if (!kernels.has(sessionId)) {
    kernels.set(sessionId, new AIKernel({
      sessionId,
      providers: {
        openai: { apiKey: process.env.OPENAI_API_KEY },
        gemini: { apiKey: process.env.GEMINI_API_KEY },
        claude: { apiKey: process.env.ANTHROPIC_API_KEY },
        local: { baseUrl: process.env.LOCAL_MODEL_URL },
      },
    }));
  }
  return kernels.get(sessionId);
}

// Process intent
router.post('/process', async (req, res) => {
  try {
    const { intent, context = {}, sessionId = 'default' } = req.body;

    if (!intent) {
      return res.status(400).json({
        success: false,
        error: 'Intent is required',
      });
    }

    const kernel = getKernel(sessionId);
    const result = await kernel.process(intent, context);

    res.json(result);
  } catch (error) {
    console.error('AI Process Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Stream processing
router.post('/stream', async (req, res) => {
  try {
    const { intent, context = {}, sessionId = 'default' } = req.body;

    if (!intent) {
      return res.status(400).json({
        success: false,
        error: 'Intent is required',
      });
    }

    const kernel = getKernel(sessionId);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of kernel.processStream(intent, context)) {
      if (chunk.error) {
        res.write(`data: ${JSON.stringify({ error: chunk.error })}\n\n`);
        break;
      }
      
      res.write(`data: ${JSON.stringify({ content: chunk.content, done: chunk.done })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('AI Stream Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get kernel status
router.get('/status', async (req, res) => {
  try {
    const sessionId = req.query.sessionId || 'default';
    const kernel = getKernel(sessionId);
    
    res.json(kernel.getStatus());
  } catch (error) {
    console.error('AI Status Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Reset context
router.post('/reset', async (req, res) => {
  try {
    const { sessionId = 'default' } = req.body;
    const kernel = getKernel(sessionId);
    kernel.resetContext();
    
    res.json({ success: true });
  } catch (error) {
    console.error('AI Reset Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Check provider health
router.get('/providers', async (req, res) => {
  try {
    const { ModelRouter } = await import('../../services/ai/ModelRouter.js');
    const router = new ModelRouter({
      openai: { apiKey: process.env.OPENAI_API_KEY },
      gemini: { apiKey: process.env.GEMINI_API_KEY },
      claude: { apiKey: process.env.ANTHROPIC_API_KEY },
      local: { baseUrl: process.env.LOCAL_MODEL_URL },
    });

    const status = await router.checkAllProviders();
    res.json(status);
  } catch (error) {
    console.error('Provider Check Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { router as aiRouter };
