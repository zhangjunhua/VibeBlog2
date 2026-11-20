import type { CategorySlug } from "../taxonomy.config";
import { withBase } from "./paths";
import type { BlogPost } from "./posts";

export function getCategoryUrl(category: CategorySlug) {
  return withBase(`/categories/${category}/`);
}

export function getTagUrl(tag: string) {
  return withBase(`/tags/${tag}/`);
}

export function getPostsByCategory(posts: BlogPost[], category: CategorySlug) {
  return posts.filter((post) => post.data.category === category);
}

export function getPostsByTag(posts: BlogPost[], tag: string) {
  return posts.filter((post) => post.data.tags.includes(tag));
}

export function getTagSummaries(posts: BlogPost[]) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
