import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Actions provides the real repository path. Local builds remain usable at /.
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const defaultBase = repositoryName && !repositoryName.endsWith('.github.io')
  ? `/${repositoryName}/` : '/';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH || defaultBase,
});
