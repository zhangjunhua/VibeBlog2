import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { site } from "../site.config";
import { withBase } from "../utils/paths";
import { getPostUrl, getPublishedPosts } from "../utils/posts";

export const GET: APIRoute = async (context) => {
  if (!context.site) {
    throw new Error("RSS 生成需要在 astro.config.mjs 中配置 site。");
  }

  const posts = await getPublishedPosts();

  return rss({
    title: site.name,
    description: site.description,
    site: new URL(withBase(), context.site),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: new URL(getPostUrl(post), context.site).toString(),
    })),
  });
};
