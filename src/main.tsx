import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as THREE from 'three';
import { validateSequenceDocument, parseSequenceJson } from './schema/SequenceValidator';
import { validateMutationDocument, parseMutationJson } from './schema/MutationValidator';
import { MutationManager } from './mutation/MutationManager';
import { ResidueManager } from './terrain/ResidueManager';
import { TerrainDemo } from './terrain/TerrainDemo';
import { TerrainManager } from './terrain/TerrainManager';

(window as any).__TEST_ENV__ = {
  validateSequenceDocument,
  parseSequenceJson,
  validateMutationDocument,
  parseMutationJson,
  MutationManager,
  ResidueManager,
  TerrainDemo,
  TerrainManager,
  THREE,
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
