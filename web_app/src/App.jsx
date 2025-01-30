import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import axios from 'axios';
import { motion } from 'framer-motion';
import Background3D from './components/Background3D';
import Controls from './components/Controls';
import ImageDisplay from './components/ImageDisplay';

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: #000;
`;

const CanvasWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const GlassPanel = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 48px 0 rgba(31, 38, 135, 0.5);
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 3.5rem;
  margin: 2rem 0;
  font-weight: bold;
  position: relative;
  letter-spacing: 2px;

  span {
    background: linear-gradient(45deg, #00ffff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 120%;
    height: 120%;
    background: radial-gradient(
      circle at center,
      rgba(0, 255, 255, 0.3) 0%,
      rgba(255, 0, 255, 0.3) 50%,
      transparent 70%
    );
    filter: blur(20px);
    animation: glowPulse 3s ease-in-out infinite;
    z-index: 0;
  }

  @keyframes glowPulse {
    0% {
      opacity: 0.5;
      transform: translateX(-50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translateX(-50%) scale(1.05);
    }
    100% {
      opacity: 0.5;
      transform: translateX(-50%) scale(1);
    }
  }
`;

function App() {
  const [prompt, setPrompt] = useState('');
  const [include, setInclude] = useState('');
  const [exclude, setExclude] = useState('');
  const [style, setStyle] = useState('');
  const [totalIterations, setTotalIterations] = useState(1000);
  const [showSteps, setShowSteps] = useState(100);
  const [generating, setGenerating] = useState(false);
  const [progressImages, setProgressImages] = useState([]);
  const [finalImage, setFinalImage] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt first!');
      return;
    }

    try {
      setGenerating(true);
      setProgressImages([]);
      setFinalImage(null);

      const response = await axios.post('http://localhost:8000/generate_image', {
        prompt,
        include: include ? include.split(',').map(item => item.trim()) : [],
        exclude: exclude,
        extras: style,
        num_iterations: totalIterations,
        num_steps: showSteps,
        guidance_scale: 7.5
      }, {
        onDownloadProgress: (progressEvent) => {
          const dataChunk = progressEvent.currentTarget.response;
          try {
            if (dataChunk) {
              const lines = dataChunk.split('\n').filter(Boolean);
              const lastLine = lines[lines.length - 1];
              const update = JSON.parse(lastLine);
              
              if (update.type === 'progress') {
                setProgressImages(prev => [...prev, {
                  step: update.step,
                  total_steps: update.total_steps,
                  iteration: update.iteration,
                  image: update.image
                }]);
              } else if (update.type === 'complete') {
                setFinalImage(update.image);
              }
            }
          } catch (e) {
            console.error('Error parsing progress:', e);
          }
        }
      });

    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppContainer>
      <CanvasWrapper>
        <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
          <Background3D />
        </Canvas>
      </CanvasWrapper>
      
      <Content>
        <Title>
          <span>AI Image Generator</span>
        </Title>
        
        <GlassPanel>
          <Controls 
            prompt={prompt}
            setPrompt={setPrompt}
            include={include}
            setInclude={setInclude}
            exclude={exclude}
            setExclude={setExclude}
            style={style}
            setStyle={setStyle}
            steps={showSteps}
            setSteps={setShowSteps}
            iterations={totalIterations}
            setIterations={setTotalIterations}
            onGenerate={handleGenerate}
            generating={generating}
          />
        </GlassPanel>

        <GlassPanel>
          <ImageDisplay 
            progressImages={progressImages}
            finalImage={finalImage}
            generating={generating}
          />
        </GlassPanel>
      </Content>
    </AppContainer>
  );
}

export default App;
