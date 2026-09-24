import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(), summary: z.string(),
    category: z.enum(['client','ballys','venture','tool','other']),
    stage: z.string(), role: z.string(), tech: z.array(z.string()), order: z.number(),
    detail: z.boolean().default(false), url: z.string().url().optional(),
    diagram: z.enum(['report','letter','chart','pipeline','library','interview','shield','sessions','none']).default('none'),
  }),
});
export const collections = { projects };
