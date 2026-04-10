import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    domain: z.string(),
    tech: z.array(z.string()),
    github: z.string().url().nullable(),
    demo: z.string().url().nullable(),
    article: z.string().url().nullable(),
    image: z.string(),
    featured: z.boolean().default(false),
    order: z.number(),
    tier: z.enum(["flagship", "supporting", "breadth"]),
    status: z.enum(["public", "private", "client-work"]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
