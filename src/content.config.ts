import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { categorySlugs } from "./taxonomy.config";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.enum(categorySlugs),
    tags: z
      .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
      .default([])
      .refine((tags) => new Set(tags).size === tags.length, {
        message: "标签不能重复",
      })
      .refine(
        (tags) =>
          tags.every(
            (tag) => !(categorySlugs as readonly string[]).includes(tag),
          ),
        { message: "标签不能与分类同名" },
      ),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
