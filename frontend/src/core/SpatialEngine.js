/**
 * AetherOS Spatial Engine
 * Core 3D environment manager for the cognitive spatial operating system
 */

import * as THREE from 'three';

export class SpatialEngine {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.nodes = new Map();
    this.connections = [];
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.init();
  }
  
  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 20);
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    
    // Lighting
    this.setupLighting();
    
    // Grid helper
    this.setupGrid();
    
    // Particle system
    this.setupParticles();
    
    // Event listeners
    this.setupEventListeners();
    
    // Start animation loop
    this.animate();
  }
  
  setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambient);
    
    // Main directional light
    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(10, 20, 10);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    this.scene.add(directional);
    
    // Accent point lights
    const colors = [0x00ffff, 0xff00ff, 0x00ff88];
    colors.forEach((color, i) => {
      const light = new THREE.PointLight(color, 0.5, 50);
      light.position.set(
        Math.cos(i * Math.PI * 2 / 3) * 15,
        5,
        Math.sin(i * Math.PI * 2 / 3) * 15
      );
      this.scene.add(light);
    });
  }
  
  setupGrid() {
    // Infinite grid
    const gridHelper = new THREE.GridHelper(100, 100, 0x1a1a2e, 0x0f0f1a);
    gridHelper.position.y = -5;
    this.scene.add(gridHelper);
    
    // Horizon glow
    const horizonGeometry = new THREE.RingGeometry(40, 60, 64);
    const horizonMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1a3e,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
    horizon.rotation.x = Math.PI / 2;
    horizon.position.y = -5;
    this.scene.add(horizon);
  }
  
  setupParticles() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorPalette = [
      new THREE.Color(0x00ffff),
      new THREE.Color(0xff00ff),
      new THREE.Color(0x00ff88),
      new THREE.Color(0x8844ff),
    ];
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Sphere distribution
      const radius = 30 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) - 5;
      positions[i3 + 2] = radius * Math.cos(phi);
      
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('click', (e) => this.onClick(e));
  }
  
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  
  onClick(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      Array.from(this.nodes.values()).map(n => n.mesh)
    );
    
    if (intersects.length > 0) {
      const node = this.findNodeByMesh(intersects[0].object);
      if (node && node.onClick) {
        node.onClick();
      }
    }
  }
  
  findNodeByMesh(mesh) {
    for (const [id, node] of this.nodes) {
      if (node.mesh === mesh) return node;
    }
    return null;
  }
  
  addNode(id, node) {
    this.nodes.set(id, node);
    if (node.mesh) {
      this.scene.add(node.mesh);
    }
  }
  
  removeNode(id) {
    const node = this.nodes.get(id);
    if (node && node.mesh) {
      this.scene.remove(node.mesh);
    }
    this.nodes.delete(id);
  }
  
  createConnection(fromId, toId, type = 'default') {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    
    if (!fromNode || !toNode) return null;
    
    const points = [
      fromNode.mesh.position.clone(),
      toNode.mesh.position.clone(),
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const colors = {
      default: 0x00ffff,
      strong: 0xff00ff,
      weak: 0x444444,
    };
    
    const material = new THREE.LineBasicMaterial({
      color: colors[type] || colors.default,
      transparent: true,
      opacity: 0.6,
    });
    
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    
    const connection = {
      id: `${fromId}-${toId}`,
      from: fromId,
      to: toId,
      line,
      type,
    };
    
    this.connections.push(connection);
    return connection;
  }
  
  updateCamera(targetPosition = null, lookAt = null) {
    if (targetPosition) {
      this.camera.position.lerp(
        new THREE.Vector3(...targetPosition),
        0.05
      );
    }
    
    if (lookAt) {
      const target = new THREE.Vector3(...lookAt);
      const current = new THREE.Vector3();
      this.camera.getWorldDirection(current);
      current.add(this.camera.position);
      current.lerp(target, 0.05);
      this.camera.lookAt(current);
    }
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    
    // Update particles rotation
    if (this.particles) {
      this.particles.rotation.y += delta * 0.02;
      this.particles.rotation.x += delta * 0.01;
    }
    
    // Update nodes
    this.nodes.forEach((node, id) => {
      if (node.update) {
        node.update(delta, elapsed);
      }
    });
    
    // Update connections
    this.connections.forEach((conn) => {
      const fromNode = this.nodes.get(conn.from);
      const toNode = this.nodes.get(conn.to);
      
      if (fromNode && toNode && fromNode.mesh && toNode.mesh) {
        const positions = conn.line.geometry.attributes.position.array;
        positions[0] = fromNode.mesh.position.x;
        positions[1] = fromNode.mesh.position.y;
        positions[2] = fromNode.mesh.position.z;
        positions[3] = toNode.mesh.position.x;
        positions[4] = toNode.mesh.position.y;
        positions[5] = toNode.mesh.position.z;
        conn.line.geometry.attributes.position.needsUpdate = true;
      }
    });
    
    // Camera idle animation
    this.camera.position.y += Math.sin(elapsed * 0.5) * 0.002;
    
    this.renderer.render(this.scene, this.camera);
  }
  
  dispose() {
    this.nodes.forEach((node, id) => {
      if (node.mesh) {
        this.scene.remove(node.mesh);
      }
    });
    
    this.connections.forEach((conn) => {
      this.scene.remove(conn.line);
    });
    
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

export default SpatialEngine;
