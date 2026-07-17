/**
 * PhysicsSimulator - Simple physics simulation for spatial nodes
 */

import * as THREE from 'three';

export class PhysicsBody {
  constructor(mesh, options = {}) {
    this.mesh = mesh;
    this.mass = options.mass || 1;
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.force = new THREE.Vector3();
    this.restitution = options.restitution || 0.8;
    this.friction = options.friction || 0.98;
    this.isStatic = options.isStatic || false;
    this.gravity = options.gravity !== undefined ? options.gravity : -9.8;
  }
  
  applyForce(force) {
    if (this.isStatic) return;
    this.force.add(force);
  }
  
  applyImpulse(impulse) {
    if (this.isStatic) return;
    this.velocity.add(impulse.clone().divideScalar(this.mass));
  }
  
  update(delta) {
    if (this.isStatic) return;
    
    // Apply gravity
    this.force.y += this.gravity * this.mass;
    
    // Calculate acceleration
    this.acceleration.copy(this.force).divideScalar(this.mass);
    
    // Update velocity
    this.velocity.add(this.acceleration.clone().multiplyScalar(delta));
    this.velocity.multiplyScalar(this.friction);
    
    // Update position
    this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));
    
    // Reset forces
    this.force.set(0, 0, 0);
  }
  
  checkBounds(bounds) {
    const pos = this.mesh.position;
    const radius = this.getRadius();
    
    // Floor collision
    if (pos.y - radius < bounds.min.y) {
      pos.y = bounds.min.y + radius;
      this.velocity.y *= -this.restitution;
    }
    
    // Ceiling collision
    if (pos.y + radius > bounds.max.y) {
      pos.y = bounds.max.y - radius;
      this.velocity.y *= -this.restitution;
    }
    
    // Walls
    if (pos.x - radius < bounds.min.x) {
      pos.x = bounds.min.x + radius;
      this.velocity.x *= -this.restitution;
    }
    if (pos.x + radius > bounds.max.x) {
      pos.x = bounds.max.x - radius;
      this.velocity.x *= -this.restitution;
    }
    
    if (pos.z - radius < bounds.min.z) {
      pos.z = bounds.min.z + radius;
      this.velocity.z *= -this.restitution;
    }
    if (pos.z + radius > bounds.max.z) {
      pos.z = bounds.max.z - radius;
      this.velocity.z *= -this.restitution;
    }
  }
  
  getRadius() {
    // Approximate radius based on mesh scale
    return this.mesh.scale.x * 0.5;
  }
}

export class PhysicsSimulator {
  constructor() {
    this.bodies = new Map();
    this.springs = [];
    this.bounds = {
      min: new THREE.Vector3(-20, -5, -20),
      max: new THREE.Vector3(20, 15, 20),
    };
  }
  
  addBody(id, mesh, options = {}) {
    const body = new PhysicsBody(mesh, options);
    this.bodies.set(id, body);
    return body;
  }
  
  removeBody(id) {
    this.bodies.delete(id);
  }
  
  getBody(id) {
    return this.bodies.get(id);
  }
  
  addSpring(bodyA, bodyB, options = {}) {
    const spring = {
      bodyA,
      bodyB,
      restLength: options.restLength || bodyA.mesh.position.distanceTo(bodyB.mesh.position),
      stiffness: options.stiffness || 50,
      damping: options.damping || 5,
    };
    this.springs.push(spring);
    return spring;
  }
  
  applySpringForces() {
    this.springs.forEach((spring) => {
      const posA = spring.bodyA.mesh.position;
      const posB = spring.bodyB.mesh.position;
      
      const delta = new THREE.Vector3().subVectors(posB, posA);
      const distance = delta.length();
      const displacement = distance - spring.restLength;
      
      // Hooke's law: F = -kx
      const force = delta.normalize().multiplyScalar(spring.stiffness * displacement);
      
      // Apply damping
      const relativeVelocity = new THREE.Vector3().subVectors(
        spring.bodyB.velocity,
        spring.bodyA.velocity
      );
      force.add(relativeVelocity.multiplyScalar(spring.damping));
      
      spring.bodyA.applyForce(force);
      spring.bodyB.applyForce(force.clone().negate());
    });
  }
  
  checkCollisions() {
    const bodies = Array.from(this.bodies.values());
    
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i];
        const bodyB = bodies[j];
        
        const distance = bodyA.mesh.position.distanceTo(bodyB.mesh.position);
        const minDistance = bodyA.getRadius() + bodyB.getRadius();
        
        if (distance < minDistance) {
          this.resolveCollision(bodyA, bodyB, distance, minDistance);
        }
      }
    }
  }
  
  resolveCollision(bodyA, bodyB, distance, minDistance) {
    const normal = new THREE.Vector3()
      .subVectors(bodyB.mesh.position, bodyA.mesh.position)
      .normalize();
    
    const overlap = minDistance - distance;
    
    // Separate bodies
    if (!bodyA.isStatic && !bodyB.isStatic) {
      bodyA.mesh.position.add(normal.clone().multiplyScalar(-overlap / 2));
      bodyB.mesh.position.add(normal.clone().multiplyScalar(overlap / 2));
    } else if (!bodyA.isStatic) {
      bodyA.mesh.position.add(normal.clone().multiplyScalar(-overlap));
    } else if (!bodyB.isStatic) {
      bodyB.mesh.position.add(normal.clone().multiplyScalar(overlap));
    }
    
    // Calculate impulse
    const relativeVelocity = new THREE.Vector3().subVectors(
      bodyA.velocity,
      bodyB.velocity
    );
    const velocityAlongNormal = relativeVelocity.dot(normal);
    
    if (velocityAlongNormal > 0) return;
    
    const restitution = Math.min(bodyA.restitution, bodyB.restitution);
    const impulse = -(1 + restitution) * velocityAlongNormal;
    const totalMass = bodyA.mass + bodyB.mass;
    
    const impulseVector = normal.clone().multiplyScalar(impulse / totalMass);
    
    if (!bodyA.isStatic) {
      bodyA.velocity.add(impulseVector.clone().multiplyScalar(bodyB.mass));
    }
    if (!bodyB.isStatic) {
      bodyB.velocity.sub(impulseVector.clone().multiplyScalar(bodyA.mass));
    }
  }
  
  update(delta) {
    // Limit delta to prevent explosion
    delta = Math.min(delta, 0.033);
    
    // Apply spring forces
    this.applySpringForces();
    
    // Update all bodies
    this.bodies.forEach((body, id) => {
      body.update(delta);
      body.checkBounds(this.bounds);
    });
    
    // Check collisions
    this.checkCollisions();
  }
  
  setBounds(min, max) {
    this.bounds = {
      min: new THREE.Vector3(...min),
      max: new THREE.Vector3(...max),
    };
  }
  
  dispose() {
    this.bodies.clear();
    this.springs = [];
  }
}

export default PhysicsSimulator;
