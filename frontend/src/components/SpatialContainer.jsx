/**
 * SpatialContainer - Main 3D canvas container
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { SpatialEngine } from '../core/SpatialEngine';
import { NodeManager } from '../core/NodeManager';
import { ParticleSystem } from '../core/ParticleSystem';
import { PhysicsSimulator } from '../core/PhysicsSimulator';
import { useSpatialStore } from '../stores/spatialStore';

const SpatialContainer = ({ onNodeClick, onNodeHover }) => {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const nodeManagerRef = useRef(null);
  const particleSystemRef = useRef(null);
  const physicsRef = useRef(null);
  
  const { 
    cameraPosition, 
    cameraTarget, 
    zoom,
    setCameraPosition,
  } = useSpatialStore();
  
  // Initialize engine
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create spatial engine
    const engine = new SpatialEngine(containerRef.current);
    engineRef.current = engine;
    
    // Create node manager
    const nodeManager = new NodeManager(engine);
    nodeManagerRef.current = nodeManager;
    
    // Create particle system
    const particles = new ParticleSystem(engine.scene);
    particleSystemRef.current = particles;
    
    // Create physics simulator
    const physics = new PhysicsSimulator();
    physicsRef.current = physics;
    
    // Add some sample nodes
    initializeSampleNodes(nodeManager, particles, physics);
    
    // Setup interaction callbacks
    engine.onClick = (event) => {
      const node = engine.findNodeByMesh(event);
      if (node && onNodeClick) {
        onNodeClick(node);
      }
    };
    
    // Handle resize
    const handleResize = () => {
      if (engine) {
        engine.onResize();
      }
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (nodeManager) nodeManager.dispose();
      if (particles) particles.dispose();
      if (physics) physics.dispose();
      if (engine) engine.dispose();
    };
  }, []);
  
  // Camera updates
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateCamera(cameraPosition, cameraTarget);
    }
  }, [cameraPosition, cameraTarget, zoom]);
  
  return (
    <div 
      ref={containerRef} 
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: 'grab',
      }}
    />
  );
};

function initializeSampleNodes(nodeManager, particles, physics) {
  // Create task nodes
  const task1 = nodeManager.createTaskNode('Meeting Notes', { 
    description: 'Q4 planning discussion',
    priority: 'high',
  });
  physics.addBody(task1.id, task1.mesh, { mass: 1 });
  
  const task2 = nodeManager.createTaskNode('Code Review', {
    description: 'Review PR #234',
    priority: 'medium',
  });
  physics.addBody(task2.id, task2.mesh, { mass: 1 });
  
  const task3 = nodeManager.createTaskNode('Documentation', {
    description: 'Update API docs',
    priority: 'low',
  });
  physics.addBody(task3.id, task3.mesh, { mass: 1 });
  
  // Create conversation nodes
  const conv1 = nodeManager.createConversationNode('AI Assistant', {
    lastMessage: 'How can I help you today?',
    unread: 2,
  });
  physics.addBody(conv1.id, conv1.mesh, { mass: 1 });
  
  // Create app nodes
  const app1 = nodeManager.createAppNode('Image Generator', {
    category: 'creative',
    lastUsed: Date.now(),
  });
  physics.addBody(app1.id, app1.mesh, { mass: 1 });
  
  const app2 = nodeManager.createAppNode('POS System', {
    category: 'business',
    lastUsed: Date.now() - 86400000,
  });
  physics.addBody(app2.id, app2.mesh, { mass: 1 });
  
  // Position nodes in space
  task1.setPosition(-5, 2, 0);
  task2.setPosition(0, 3, 2);
  task3.setPosition(5, 1, -1);
  conv1.setPosition(-3, 0, -3);
  app1.setPosition(4, 2, 3);
  app2.setPosition(2, 0, -4);
  
  // Create connections
  nodeManager.connectNodes(task1.id, conv1.id, 'default');
  nodeManager.connectNodes(task2.id, conv1.id, 'default');
  nodeManager.connectNodes(app1.id, task3.id, 'weak');
  nodeManager.connectNodes(app2.id, task1.id, 'strong');
  
  // Create particle emitter for ambient effects
  particles.createEmitter('ambient', {
    position: [0, 5, 0],
    color: 0x00ffff,
    count: 200,
    speed: 0.5,
    lifetime: 5,
    spread: Math.PI / 4,
    size: 0.05,
  });
}

export default SpatialContainer;
