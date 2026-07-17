/**
 * NodeManager - Manages spatial nodes in the AetherOS environment
 */

import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

export class SpatialNode {
  constructor(options = {}) {
    this.id = options.id || uuidv4();
    this.type = options.type || 'default';
    this.position = new THREE.Vector3(...(options.position || [0, 0, 0]));
    this.rotation = new THREE.Euler(...(options.rotation || [0, 0, 0]));
    this.scale = new THREE.Vector3(...(options.scale || [1, 1, 1]));
    this.data = options.data || {};
    this.label = options.label || '';
    this.color = options.color || 0x00ffff;
    this.onClick = options.onClick || null;
    this.mesh = null;
    this.velocity = new THREE.Vector3();
    this.connections = [];
    
    this.createMesh();
  }
  
  createMesh() {
    let geometry;
    
    switch (this.type) {
      case 'task':
        geometry = new THREE.BoxGeometry(1.5, 0.3, 1);
        break;
      case 'conversation':
        geometry = new THREE.SphereGeometry(0.8, 32, 32);
        break;
      case 'app':
        geometry = new THREE.OctahedronGeometry(0.8);
        break;
      case 'file':
        geometry = new THREE.TetrahedronGeometry(0.6);
        break;
      case 'agent':
        geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
        break;
      default:
        geometry = new THREE.IcosahedronGeometry(0.6);
    }
    
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
    this.mesh.scale.copy(this.scale);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Add glow effect
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(geometry.clone(), glowMaterial);
    glowMesh.scale.multiplyScalar(1.2);
    this.mesh.add(glowMesh);
    
    // Add label if exists
    if (this.label) {
      this.createLabel();
    }
    
    // Store reference to self
    this.mesh.userData.node = this;
  }
  
  createLabel() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 48px Inter, sans-serif';
    context.textAlign = 'center';
    context.fillStyle = '#ffffff';
    context.fillText(this.label, canvas.width / 2, canvas.height / 2 + 15);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 0.5, 1);
    sprite.position.y = 1.2;
    
    this.mesh.add(sprite);
  }
  
  update(delta, elapsed) {
    // Floating animation
    this.mesh.position.y = this.position.y + Math.sin(elapsed * 2 + this.id.charCodeAt(0)) * 0.1;
    
    // Rotation
    this.mesh.rotation.y += delta * 0.5;
    
    // Pulse effect based on connections
    const connectionIntensity = Math.min(this.connections.length * 0.1, 0.5);
    this.mesh.material.emissiveIntensity = 0.3 + connectionIntensity + Math.sin(elapsed * 3) * 0.1;
  }
  
  connectTo(node) {
    if (!this.connections.includes(node.id)) {
      this.connections.push(node.id);
      node.connections.push(this.id);
    }
  }
  
  disconnectFrom(nodeId) {
    this.connections = this.connections.filter(id => id !== nodeId);
  }
  
  setPosition(x, y, z) {
    this.position.set(x, y, z);
    if (this.mesh) {
      this.mesh.position.copy(this.position);
    }
  }
  
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    this.connections = [];
  }
}

export class NodeManager {
  constructor(spatialEngine) {
    this.engine = spatialEngine;
    this.nodes = new Map();
    this.categories = new Map();
  }
  
  createNode(options) {
    const node = new SpatialNode(options);
    this.nodes.set(node.id, node);
    this.engine.addNode(node.id, node);
    
    // Categorize
    const category = options.category || 'default';
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category).add(node.id);
    
    return node;
  }
  
  createTaskNode(label, data = {}) {
    return this.createNode({
      type: 'task',
      label,
      color: 0x00ff88,
      data,
      category: 'tasks',
    });
  }
  
  createConversationNode(label, data = {}) {
    return this.createNode({
      type: 'conversation',
      label,
      color: 0xff00ff,
      data,
      category: 'conversations',
    });
  }
  
  createAppNode(label, data = {}) {
    return this.createNode({
      type: 'app',
      label,
      color: 0x00ffff,
      data,
      category: 'apps',
    });
  }
  
  createFileNode(label, data = {}) {
    return this.createNode({
      type: 'file',
      label,
      color: 0xffaa00,
      data,
      category: 'files',
    });
  }
  
  createAgentNode(label, data = {}) {
    return this.createNode({
      type: 'agent',
      label,
      color: 0x8844ff,
      data,
      category: 'agents',
    });
  }
  
  connectNodes(fromId, toId, type = 'default') {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    
    if (fromNode && toNode) {
      fromNode.connectTo(toNode);
      return this.engine.createConnection(fromId, toId, type);
    }
    return null;
  }
  
  removeNode(id) {
    const node = this.nodes.get(id);
    if (node) {
      // Remove from categories
      this.categories.forEach((set) => {
        set.delete(id);
      });
      
      // Disconnect from others
      node.connections.forEach((connId) => {
        const connNode = this.nodes.get(connId);
        if (connNode) {
          connNode.disconnectFrom(id);
        }
      });
      
      node.dispose();
      this.engine.removeNode(id);
      this.nodes.delete(id);
    }
  }
  
  getNodesByCategory(category) {
    const ids = this.categories.get(category) || new Set();
    return Array.from(ids).map(id => this.nodes.get(id)).filter(Boolean);
  }
  
  getNearbyNodes(position, radius = 10) {
    const nearby = [];
    const pos = new THREE.Vector3(...position);
    
    this.nodes.forEach((node) => {
      const distance = node.position.distanceTo(pos);
      if (distance <= radius) {
        nearby.push({ node, distance });
      }
    });
    
    return nearby.sort((a, b) => a.distance - b.distance);
  }
  
  arrangeInFormation(category, centerPosition = [0, 0, 0], radius = 8) {
    const nodes = this.getNodesByCategory(category);
    const angleStep = (Math.PI * 2) / nodes.length;
    
    nodes.forEach((node, index) => {
      const angle = index * angleStep;
      const x = centerPosition[0] + Math.cos(angle) * radius;
      const z = centerPosition[2] + Math.sin(angle) * radius;
      const y = centerPosition[1] + Math.sin(index) * 2;
      
      node.setPosition(x, y, z);
    });
  }
  
  clearCategory(category) {
    const ids = Array.from(this.categories.get(category) || []);
    ids.forEach((id) => this.removeNode(id));
  }
  
  dispose() {
    this.nodes.forEach((node, id) => {
      node.dispose();
      this.engine.removeNode(id);
    });
    this.nodes.clear();
    this.categories.clear();
  }
}

export default NodeManager;
