import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import gsap from 'gsap';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5),
                0 0 20px rgba(0, 255, 255, 0.3),
                0 0 30px rgba(0, 255, 255, 0.1);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.5),
                0 0 30px rgba(255, 0, 255, 0.3),
                0 0 45px rgba(255, 0, 255, 0.1);
  }
  100% {
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5),
                0 0 20px rgba(0, 255, 255, 0.3),
                0 0 30px rgba(0, 255, 255, 0.1);
  }
`;

const DisplayContainer = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.6s ease-out;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ImageCard = styled.div`
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  transition: all 0.3s ease;
  animation: ${glow} 3s infinite;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 0 20px rgba(255, 0, 255, 0.5),
                0 0 40px rgba(255, 0, 255, 0.3),
                0 0 60px rgba(255, 0, 255, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(45deg);
    animation: ${shimmer} 2s infinite;
  }
`;

const ProgressInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.9rem;
  text-align: center;
  backdrop-filter: blur(5px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease;

  ${ImageCard}:hover & {
    transform: translateY(0);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;

  ${ImageCard}:hover & {
    transform: scale(1.05);
  }
`;

const FinalImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 2rem;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.3);
  animation: ${glow} 3s infinite;
  
  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  &:hover {
    transform: scale(1.02);
    transition: transform 0.3s ease;
  }
`;

const FinalImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;

  ${FinalImageContainer}:hover & {
    transform: scale(1.05);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const LoadingContainer = styled.div`
  width: 100%;
  padding: 3rem;
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  animation: ${glow} 3s infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #00ffff, #ff00ff, #00ffff);
    background-size: 200% 200%;
    animation: ${gradientMove} 2s linear infinite;
  }
`;

const LoadingText = styled.div`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: ${gradientMove} 3s linear infinite;
`;

const ProgressDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProgressItem = styled.div`
  text-align: center;
  
  h4 {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  span {
    font-size: 1.2rem;
    color: white;
    font-weight: 500;
    background: linear-gradient(45deg, #00ffff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const NoImagesMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  animation: ${glow} 3s infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(45deg);
    animation: ${shimmer} 2s infinite;
  }
`;

function ImageDisplay({ progressImages, finalImage, generating }) {
  useEffect(() => {
    if (progressImages.length > 0) {
      gsap.from('.image-card', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }
  }, [progressImages]);

  const currentIteration = progressImages.length > 0 ? progressImages[progressImages.length - 1].iteration : 0;
  const currentStep = progressImages.length > 0 ? progressImages[progressImages.length - 1].step : 0;
  const totalSteps = progressImages.length > 0 ? progressImages[progressImages.length - 1].total_steps : 0;

  if (!progressImages.length && !finalImage && !generating) {
    return (
      <DisplayContainer>
        <NoImagesMessage>
          Enter a prompt and click generate to create images
        </NoImagesMessage>
      </DisplayContainer>
    );
  }

  return (
    <DisplayContainer>
      {generating && (
        <LoadingContainer>
          <LoadingText>Creating your masterpiece...</LoadingText>
          <ProgressDetails>
            <ProgressItem>
              <h4>Current Iteration</h4>
              <span>{currentIteration}</span>
            </ProgressItem>
            <ProgressItem>
              <h4>Generation Progress</h4>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </ProgressItem>
          </ProgressDetails>
        </LoadingContainer>
      )}

      {finalImage && (
        <FinalImageContainer>
          <FinalImage 
            src={`data:image/png;base64,${finalImage}`}
            alt="Final generated image"
          />
        </FinalImageContainer>
      )}

      {progressImages.length > 0 && (
        <ImageGrid>
          {progressImages.map((img, index) => (
            <ImageCard key={index} className="image-card">
              <Image 
                src={`data:image/png;base64,${img.image}`}
                alt={`Generation step ${img.step}`}
                loading="lazy"
              />
              <ProgressInfo>
                Iteration {img.iteration} - Step {img.step}/{img.total_steps}
              </ProgressInfo>
            </ImageCard>
          ))}
        </ImageGrid>
      )}
    </DisplayContainer>
  );
}

export default ImageDisplay;
