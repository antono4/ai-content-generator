/**
 * AetherOS - Main Application Component
 */

import React, { useState, useCallback } from 'react';
import SpatialContainer from './components/SpatialContainer';
import CommandPalette from './components/CommandPalette';
import MicroAppPortal from './components/MicroAppPortal';
import { useSpatialStore } from './stores/spatialStore';
import { useAIKernelStore } from './stores/aiKernelStore';
import { useKnowledgeStore } from './stores/knowledgeStore';

const App = () => {
  const [activeApp, setActiveApp] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  
  const { selectedNodeId, hoverNode, clearSelection } = useSpatialStore();
  const { isProcessing, setProcessing, providerStatus } = useAIKernelStore();
  const { addIntent } = useAIKernelStore();
  
  // Handle AI command submission
  const handleCommandSubmit = useCallback(async (command) => {
    setProcessing(true);
    
    try {
      // Track intent
      addIntent({
        type: 'command',
        text: command,
        timestamp: Date.now(),
      });
      
      // In production, this would call the backend API
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: command,
          context: {},
        }),
      });
      
      const data = await response.json();
      
      // Handle response
      if (data.app) {
        setActiveApp(data.app);
      }
      
      // Handle other actions from AI response
      if (data.actions) {
        data.actions.forEach((action) => {
          console.log('AI Action:', action);
        });
      }
    } catch (error) {
      console.error('AI Processing Error:', error);
    } finally {
      setProcessing(false);
    }
  }, [setProcessing, addIntent]);
  
  // Handle node interactions
  const handleNodeClick = useCallback((node) => {
    setActiveNode(node);
    
    // Determine action based on node type
    switch (node.type) {
      case 'conversation':
        // Open conversation
        console.log('Opening conversation:', node.label);
        break;
      case 'app':
        // Launch app
        console.log('Launching app:', node.label);
        break;
      case 'task':
        // Show task details
        console.log('Showing task:', node.label);
        break;
      default:
        console.log('Node clicked:', node.id);
    }
  }, []);
  
  const handleNodeHover = useCallback((node) => {
    if (node) {
      hoverNode(node.id);
    }
  }, [hoverNode]);
  
  const handleCloseApp = useCallback(() => {
    setActiveApp(null);
  }, []);
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, #0f0f1f 0%, #0a0a0f 100%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* 3D Spatial Environment */}
      <SpatialContainer
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
      />
      
      {/* Active node info panel */}
      {activeNode && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '320px',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#00ffff', fontSize: '12px', textTransform: 'uppercase' }}>
              {activeNode.type}
            </span>
            <button
              onClick={() => setActiveNode(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ×
            </button>
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>{activeNode.label}</h3>
          {activeNode.data && activeNode.data.description && (
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
              {activeNode.data.description}
            </p>
          )}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #00ffff, #00aa88)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Open
            </button>
            <button
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Connect
            </button>
          </div>
        </div>
      )}
      
      {/* Command Palette */}
      <CommandPalette
        onSubmit={handleCommandSubmit}
        isProcessing={isProcessing}
        providers={providerStatus}
      />
      
      {/* Status bar */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(10, 10, 15, 0.8)',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 255, 255, 0.2)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ff88',
            }}
          />
          <span style={{ color: '#fff', fontWeight: 600 }}>AetherOS</span>
        </div>
      </div>
      
      {/* Micro-App Portal */}
      {activeApp && (
        <MicroAppPortal
          app={activeApp}
          onClose={handleCloseApp}
        />
      )}
      
      {/* Help overlay */}
      <div
        style={{
          position: 'fixed',
          bottom: '140px',
          right: '20px',
          background: 'rgba(10, 10, 15, 0.8)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ marginBottom: '4px' }}>Drag to rotate • Scroll to zoom</div>
        <div>Click node to select • Press ⌘K for command</div>
      </div>
    </div>
  );
};

export default App;
