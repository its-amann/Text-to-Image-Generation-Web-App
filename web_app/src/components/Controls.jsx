import React from 'react';
import styled, { keyframes } from 'styled-components';

const glowEffect = keyframes`
  0% { box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff; }
  50% { box-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff; }
  100% { box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff; }
`;

const InputGlow = keyframes`
  0% { border-color: rgba(0, 255, 255, 0.5); }
  50% { border-color: rgba(255, 0, 255, 0.5); }
  100% { border-color: rgba(0, 255, 255, 0.5); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const InfoBox = styled.div`
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  
  h3 {
    color: white;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    background: linear-gradient(45deg, #00ffff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0;
  }

  li {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;

    &::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #ff00ff;
    }
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: white;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledInput = styled.input`
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  animation: ${InputGlow} 3s infinite;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #ff00ff;
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const GenerateButton = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    animation: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 60%
    );
    transform: rotate(45deg);
    animation: ${glowEffect} 3s infinite;
  }
`;

const Controls = ({
  prompt,
  setPrompt,
  include,
  setInclude,
  exclude,
  setExclude,
  style,
  setStyle,
  steps,
  setSteps,
  iterations,
  setIterations,
  onGenerate,
  generating
}) => {
  const handleStepsChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setSteps(value);
  };

  const handleIterationsChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setIterations(value);
  };

  return (
    <Container>
      <InfoBox>
        <h3>How to Use</h3>
        <p><strong>Text Prompt:</strong> Describe the image you want to generate in detail. The more specific your description, the better the results.</p>
        <p><strong>Design Elements:</strong></p>
        <ul>
          <li><strong>Include:</strong> Additional elements you want to include in the image (e.g., "mountains in background, river in foreground")</li>
          <li><strong>Style:</strong> The artistic style or medium (e.g., "watercolor painting", "pencil sketch", "digital art")</li>
          <li><strong>Exclude:</strong> Elements you want to avoid in the generated image (e.g., "text, watermarks, blurry effects")</li>
        </ul>
        <p><strong>Parameters:</strong></p>
        <ul>
          <li><strong>Total Iterations:</strong> The total number of iterations the model will perform to generate the image. Higher values (e.g., 200, 1000, 3000) generally result in better quality but take longer to generate.</li>
          <li><strong>Show Steps:</strong> Controls how often you'll see the generation progress. For example, if Total Iterations is 1000 and Show Steps is 100, you'll see updates at iterations 100, 200, 300, etc. This helps you monitor the generation process.</li>
        </ul>
      </InfoBox>

      <InputGroup>
        <Label htmlFor="prompt">Enter your prompt</Label>
        <StyledInput
          id="prompt"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          disabled={generating}
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="include">Include Elements (optional)</Label>
        <StyledInput
          id="include"
          type="text"
          value={include}
          onChange={(e) => setInclude(e.target.value)}
          placeholder="Additional elements to include (comma separated)..."
          disabled={generating}
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="style">Design Style (optional)</Label>
        <StyledInput
          id="style"
          type="text"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="Artistic style or medium (e.g. watercolor, pencil sketch)..."
          disabled={generating}
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="exclude">Exclude Elements (optional)</Label>
        <StyledInput
          id="exclude"
          type="text"
          value={exclude}
          onChange={(e) => setExclude(e.target.value)}
          placeholder="Elements to exclude from the image..."
          disabled={generating}
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="iterations">
          Total Iterations
          <span>{iterations}</span>
        </Label>
        <StyledInput
          id="iterations"
          type="number"
          min="1"
          value={iterations}
          onChange={handleIterationsChange}
          placeholder="Enter total number of iterations..."
          disabled={generating}
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="steps">
          Show Steps
          <span>{steps}</span>
        </Label>
        <StyledInput
          id="steps"
          type="number"
          min="1"
          value={steps}
          onChange={handleStepsChange}
          placeholder="Enter step interval to show progress..."
          disabled={generating}
        />
      </InputGroup>

      <GenerateButton 
        onClick={onGenerate}
        disabled={generating || !prompt.trim()}
      >
        {generating ? 'Generating...' : 'Generate Image'}
      </GenerateButton>
    </Container>
  );
};

export default Controls;
