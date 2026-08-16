import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

function readBuildIdentity() {
  let commit = 'unknown';
  try {
    commit = execSync('git rev-parse --short=12 HEAD', { encoding: 'utf8' }).trim() || 'unknown';
  } catch {
    // A source archive may not contain .git; keep the identity explicit rather than inventing one.
  }

  let version = 'unknown';
  try {
    const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')) as { version?: string };
    version = pkg.version ?? 'unknown';
  } catch {
    // Keep an explicit unknown if package metadata cannot be read.
  }

  return { commit, version };
}

export default defineConfig(() => {
  const build = readBuildIdentity();
  return {
    plugins: [react(), tailwindcss()],
    define: {
      __AETHERVFX_BUILD_COMMIT__: JSON.stringify(build.commit),
      __AETHERVFX_BUILD_VERSION__: JSON.stringify(build.version),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
