import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';

function Particles({ count = 5000 }) {
  const points = useRef();
  const hover = useRef(false);
  const mousePosition = useRef({ x: 0, y: 0 });

  // Create particles with enhanced color gradients
  const particlesData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distribute particles in a sphere with varying density
      const radius = (1 + Math.random()) * 25;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Enhanced gradient colors from cyan to magenta
      const t = Math.random();
      const hue = t * 0.3 + 0.5; // Range from cyan to magenta
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Dynamic scales for more visual interest
      scales[i] = Math.random() * 3 + 0.5;

      // Add velocities for more dynamic movement
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return { positions, colors, scales, velocities };
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate the entire particle system with varying speeds
    points.current.rotation.y = time * 0.1;
    points.current.rotation.z = Math.sin(time * 0.05) * 0.2;

    // Update particle positions with more complex motion
    const positions = points.current.geometry.attributes.position.array;
    const scales = points.current.geometry.attributes.scale.array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Add wave motion
      positions[i3] += Math.sin(time * 0.5 + positions[i3 + 1] * 0.05) * 0.02;
      positions[i3 + 1] += Math.cos(time * 0.5 + positions[i3] * 0.05) * 0.02;
      positions[i3 + 2] += Math.sin(time * 0.5 + positions[i3 + 2] * 0.05) * 0.02;

      // Add breathing effect to particle sizes
      scales[i] = particlesData.scales[i] * (1 + Math.sin(time * 2 + i) * 0.3);
      
      // Add mouse interaction with improved responsiveness
      if (hover.current) {
        const dx = mousePosition.current.x - positions[i3];
        const dy = mousePosition.current.y - positions[i3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 3) {
          const force = (1 - dist / 3) * 0.05;
          positions[i3] += dx * force;
          positions[i3 + 1] += dy * force;
        }
      }

      // Keep particles within bounds
      const radius = Math.sqrt(
        positions[i3] * positions[i3] +
        positions[i3 + 1] * positions[i3 + 1] +
        positions[i3 + 2] * positions[i3 + 2]
      );
      
      if (radius > 30) {
        const scale = 29 / radius;
        positions[i3] *= scale;
        positions[i3 + 1] *= scale;
        positions[i3 + 2] *= scale;
      }
    }
    
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.geometry.attributes.scale.needsUpdate = true;
  });

  // Animated entrance
  const { scale } = useSpring({
    from: { scale: 0 },
    to: { scale: 1 },
    config: { mass: 2, tension: 200, friction: 100 }
  });

  return (
    <animated.points ref={points} scale={scale}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={count}
          array={particlesData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attachObject={['attributes', 'color']}
          count={count}
          array={particlesData.colors}
          itemSize={3}
        />
        <bufferAttribute
          attachObject={['attributes', 'scale']}
          count={count}
          array={particlesData.scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </animated.points>
  );
}

function Background3D() {
  return (
    <>
      <color attach="background" args={['#000']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />
      <fog attach="fog" args={['#000', 25, 45]} />
      <Particles />
    </>
  );
}

export default Background3D;
