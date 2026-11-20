export const categorySlugs = ["learning", "life", "experience"] as const;

export type CategorySlug = (typeof categorySlugs)[number];

export const categories = [
  {
    slug: "learning",
    label: "学习",
    description: "学习过程中的方法、收获与仍然困惑的问题。",
  },
  {
    slug: "life",
    label: "生活",
    description: "平凡的日常、偶然的观察与值得纪念的瞬间。",
  },
  {
    slug: "experience",
    label: "经验",
    description: "亲自实践过的方法，以及没有一次成功的尝试。",
  },
] as const satisfies readonly {
  slug: CategorySlug;
  label: string;
  description: string;
}[];

export type Category = (typeof categories)[number];

export function getCategory(slug: CategorySlug) {
  return categories.find((category) => category.slug === slug)!;
}
