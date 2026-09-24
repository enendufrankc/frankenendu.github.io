import { defineConfig } from 'astro/config';
const github = process.env.PORTFOLIO_TARGET === 'github';
export default defineConfig({
  site: 'https://frankenendu.link',
  base: github ? '/frankenendu.github.io' : '/',
  outDir: github ? './dist-github' : './dist',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { tsconfig: './tsconfig.json' },
});
