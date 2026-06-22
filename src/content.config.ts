import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    // Universal display fields
    title: z.string(),
    description: z.string(),
    image: z.string(),
    order: z.number(),

    // Stack & links
    tech: z.array(z.string()),
    github: z.string().url().nullable().optional(),
    demo: z.string().url().nullable().optional(),
    article: z.string().url().nullable().optional(),
    live_url: z.string().url().nullable().optional(),

    // New classification fields
    type: z.enum(["client", "product"]),
    service: z.enum([
      "custom-platforms",
      "conversational-ai",
      "personalisation",
      "multi-modal-content",
    ]),
    industry: z.string(),
    tier: z.enum(["featured", "secondary", "archived"]),

    // Visibility (retained from old schema, semantics unchanged)
    status: z.enum(["public", "private", "client-work"]),

    // Optional rich blocks
    testimonial: z
      .object({
        quote: z.string(),
        author: z.string(),
        role: z.string(),
        is_draft: z.boolean().default(true),
      })
      .optional(),
    outcome_bullets: z.array(z.string()).default([]),

    // Retained for back-compat with existing files; may be removed later
    domain: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/insights" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, insights };
