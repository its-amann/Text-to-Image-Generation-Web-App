import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, useSpring, useMotionValue, useTransform, animate } from 'framer-motion';

const CursorContainer = styled(motion.div)`
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  mix-blend-mode: exclusion;
`;

const Ring = styled(motion.div)`
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  transform-origin: center;
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  transform-origin: center;
  filter: blur(0.5px);
`;

const Trail = styled(motion.div)`
  position: fixed;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  pointer-events: none;
  mix-blend-mode: screen;
`;

const AnimatedCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorSize = useMotionValue(1);
  const trailsRef = useRef([]);
  const [trails, setTrails] = useState([]);
  const isHovered = useRef(false);

  const springConfig = { damping: 25, stiffness: 300 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);
  const scale = useSpring(cursorSize, springConfig);

  const opacity = useTransform(scale, [1, 1.5], [0.6, 1]);
  const ringScale = useTransform(scale, [1, 1.5], [1, 1.3]);
  const dotScale = useTransform(scale, [1, 1.5], [1, 0.5]);

  useEffect(() => {
    const updateMousePosition = (e) => {
      cursorX.set(e.clientX - 24);
      cursorY.set(e.clientY - 24);

      // Add trail with timestamp
      const newTrail = {
        x: e.clientX - 3,
        y: e.clientY - 3,
        timestamp: Date.now()
      };
      trailsRef.current = [newTrail, ...trailsRef.current].slice(0, 20);
      setTrails([...trailsRef.current]);
    };

    const updateHoverState = (e) => {
      const target = e.target;
      if (target.matches('button, input, a, [role="button"]')) {
        if (!isHovered.current) {
          isHovered.current = true;
          animate(cursorSize, 1.5, {
            type: "spring",
            damping: 15,
            stiffness: 200
          });
        }
      } else if (isHovered.current) {
        isHovered.current = false;
        animate(cursorSize, 1, {
          type: "spring",
          damping: 15,
          stiffness: 200
        });
      }
    };

    document.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseover', updateHoverState);

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseover', updateHoverState);
    };
  }, [cursorX, cursorY, cursorSize]);

  return (
    <>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        const opacity = Math.max(0, 1 - age / 200); // Fade out over 200ms
        const scale = Math.max(0.2, 1 - index * 0.05);
        
        return (
          <Trail
            key={trail.timestamp}
            style={{
              left: trail.x,
              top: trail.y,
              opacity,
              scale,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale, opacity }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 200
            }}
          />
        );
      })}
      <CursorContainer style={{ x, y }}>
        <Ring
          style={{
            scale: ringScale,
            opacity
          }}
        />
        <Dot
          style={{
            scale: dotScale,
            opacity
          }}
        />
      </CursorContainer>
    </>
  );
};

export default AnimatedCursor;
