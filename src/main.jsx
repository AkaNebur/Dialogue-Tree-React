// File: src/main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 1. Import React Flow base styles FIRST
import 'reactflow/dist/style.css';

// 2. Import your custom styles SECOND (to override defaults and add theme variables)
import './styles/index.css'; // This now contains dark theme variables and overrides

// Create React root and render app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);