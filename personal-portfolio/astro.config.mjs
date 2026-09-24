import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://enendufrankc.github.io',
  base: '/frankenendu.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Keep TypeScript discovery inside this app, independent of the parent application.
  vite: { tsconfig: './tsconfig.json' },
});
