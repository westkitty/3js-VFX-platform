import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as THREE from 'three';
import { validateSequenceDocument, parseSequenceJson } from './schema/SequenceValidator';
import { TerrainManager } from './terrain/TerrainManager';

(window as any).__TEST_ENV__ = {
  validateSequenceDocument,
  parseSequenceJson,
  TerrainManager,
  THREE,
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
