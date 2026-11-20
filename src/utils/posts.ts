import { getCollection, type CollectionEntry } from "astro:content";
import { withBase } from "./paths";

export type BlogPost = CollectionEntry<"blog">;

export async function getPublishedPosts() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  return posts.sort(
    (a, b) =>
      b.data.pubDate.getTime() - a.data.pubDate.getTime() ||
      a.id.localeCompare(b.id),
  );
}

export function getPostUrl(post: BlogPost) {
  return withBase(`/blog/${post.id}/`);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function toDateAttribute(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function groupPostsByYear(posts: BlogPost[]) {
  const groups = new Map<string, BlogPost[]>();

  for (const post of posts) {
    const year = String(post.data.pubDate.getUTCFullYear());
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }

  return [...groups.entries()]
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }))
    .sort((a, b) => Number(b.year) - Number(a.year));
}
