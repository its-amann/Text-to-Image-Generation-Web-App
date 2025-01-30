import React from 'react'
import ReactDOM from 'react-dom/client'
import styled, { createGlobalStyle } from 'styled-components'
import App from './App'
import AnimatedCursor from './components/AnimatedCursor'

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #00ffff, #ff00ff);
    border-radius: 5px;
    
    &:hover {
      background: linear-gradient(45deg, #ff00ff, #00ffff);
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #000;
    color: #fff;
    overflow-x: hidden;
    cursor: none;
  }

  button, input, a, [role="button"] {
    cursor: none;
    
    &:hover {
      cursor: none;
    }
  }

  #root {
    width: 100vw;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes gradientBg {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  ::selection {
    background: rgba(255, 0, 255, 0.3);
    color: #fff;
  }

  ::-moz-selection {
    background: rgba(255, 0, 255, 0.3);
    color: #fff;
  }
`

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
    <AnimatedCursor />
  </React.StrictMode>
)
