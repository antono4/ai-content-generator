/**
 * ParticleSystem - Visual effects and particle animations
 */

import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.emitters = new Map();
    this.particles = [];
  }
  
  createEmitter(id, options = {}) {
    const emitter = {
      id,
      position: new THREE.Vector3(...(options.position || [0, 0, 0])),
      color: options.color || 0x00ffff,
      count: options.count || 100,
      speed: options.speed || 1,
      lifetime: options.lifetime || 3,
      spread: options.spread || Math.PI * 2,
      size: options.size || 0.1,
      particles: [],
    };
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(emitter.count * 3);
    const colors = new Float32Array(emitter.count * 3);
    const sizes = new Float32Array(emitter.count);
    const lifetimes = new Float32Array(emitter.count);
    
    const color = new THREE.Color(emitter.color);
    
    for (let i = 0; i < emitter.count; i++) {
      const i3 = i * 3;
      
      // Initial positions at emitter center
      positions[i3] = emitter.position.x;
      positions[i3 + 1] = emitter.position.y;
      positions[i3 + 2] = emitter.position.z;
      
      // Colors
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Random sizes
      sizes[i] = emitter.size * (0.5 + Math.random() * 0.5);
      
      // Staggered lifetimes
      lifetimes[i] = Math.random() * emitter.lifetime;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    
    const material = new THREE.PointsMaterial({
      size: emitter.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    emitter.points = new THREE.Points(geometry, material);
    emitter.points.position.copy(emitter.position);
    emitter.velocity = new Float32Array(emitter.count * 3);
    
    this.scene.add(emitter.points);
    this.emitters.set(id, emitter);
    
    return emitter;
  }
  
  updateEmitter(id, delta) {
    const emitter = this.emitters.get(id);
    if (!emitter) return;
    
    const positions = emitter.points.geometry.attributes.position.array;
    const lifetimes = emitter.points.geometry.attributes.lifetime.array;
    const velocity = emitter.velocity;
    
    for (let i = 0; i < emitter.count; i++) {
      const i3 = i * 3;
      
      // Update lifetime
      lifetimes[i] += delta;
      
      // Reset particle if lifetime exceeded
      if (lifetimes[i] >= emitter.lifetime) {
        lifetimes[i] = 0;
        
        // Reset position to emitter
        positions[i3] = emitter.position.x;
        positions[i3 + 1] = emitter.position.y;
        positions[i3 + 2] = emitter.position.z;
        
        // Random velocity in cone
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * emitter.spread;
        const speed = emitter.speed * (0.5 + Math.random() * 0.5);
        
        velocity[i3] = Math.cos(theta) * Math.sin(phi) * speed;
        velocity[i3 + 1] = Math.cos(phi) * speed;
        velocity[i3 + 2] = Math.sin(theta) * Math.sin(phi) * speed;
      }
      
      // Update position
      positions[i3] += velocity[i3] * delta;
      positions[i3 + 1] += velocity[i3 + 1] * delta;
      positions[i3 + 2] += velocity[i3 + 2] * delta;
      
      // Apply gravity
      velocity[i3 + 1] -= 2 * delta;
    }
    
    emitter.points.geometry.attributes.position.needsUpdate = true;
    emitter.points.geometry.attributes.lifetime.needsUpdate = true;
  }
  
  update(delta) {
    this.emitters.forEach((emitter, id) => {
      this.updateEmitter(id, delta);
    });
  }
  
  removeEmitter(id) {
    const emitter = this.emitters.get(id);
    if (emitter) {
      this.scene.remove(emitter.points);
      emitter.points.geometry.dispose();
      emitter.points.material.dispose();
      this.emitters.delete(id);
    }
  }
  
  createExplosion(position, options = {}) {
    const id = `explosion-${Date.now()}`;
    const emitter = this.createEmitter(id, {
      position,
      color: options.color || 0xff00ff,
      count: options.count || 500,
      speed: options.speed || 10,
      lifetime: options.lifetime || 2,
      spread: Math.PI,
      size: options.size || 0.15,
    });
    
    // Burst all particles at once
    const lifetimes = emitter.points.geometry.attributes.lifetime.array;
    for (let i = 0; i < emitter.count; i++) {
      lifetimes[i] = Math.random() * emitter.lifetime * 0.8;
    }
    emitter.points.geometry.attributes.lifetime.needsUpdate = true;
    
    // Auto-remove after explosion
    setTimeout(() => {
      this.removeEmitter(id);
    }, options.lifetime * 1000 + 500);
    
    return emitter;
  }
  
  createTrail(fromPosition, toPosition, options = {}) {
    const points = [];
    const segments = options.segments || 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(...fromPosition),
        new THREE.Vector3(...toPosition),
        t
      );
      
      // Add wave effect
      point.y += Math.sin(t * Math.PI * 4) * 0.2;
      points.push(point);
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: options.color || 0x00ffff,
      transparent: true,
      opacity: options.opacity || 0.6,
      blending: THREE.AdditiveBlending,
    });
    
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    
    return {
      line,
      geometry,
      material,
      animate: (progress) => {
        // Animate line appearance
        material.opacity = Math.sin(progress * Math.PI) * (options.opacity || 0.6);
        line.scale.setScalar(1 + Math.sin(progress * Math.PI) * 0.2);
      },
      dispose: () => {
        this.scene.remove(line);
        geometry.dispose();
        material.dispose();
      },
    };
  }
  
  dispose() {
    this.emitters.forEach((emitter, id) => {
      this.removeEmitter(id);
    });
  }
}

export default ParticleSystem;
