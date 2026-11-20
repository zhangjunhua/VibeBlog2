# 博客功能迭代实施计划

## Context

首版博客已经具备核心阅读、RSS、SEO 和 GitHub Pages 自动部署能力。下一阶段希望提升内容组织和阅读效率，并加入站内搜索与读者评论，同时继续保持无自建后端、少客户端 JavaScript、代码易维护。

本轮包含四项能力：

- 单一主分类 + 多标签及静态聚合页。
- 文章目录、阅读时长、上一篇/下一篇。
- Pagefind 构建期全文搜索。
- Giscus + GitHub Discussions 文章评论。

分类、目录、阅读时长和相邻文章全部静态生成；只有搜索页和文章评论区加载对应第三方脚本。

## 1. 扩展内容模型与分类标签

### 内容约定

在 `src/content.config.ts` 增加：

- `category`：必填单分类，仅允许 `learning`、`life`、`experience`。
- `tags`：默认空数组，标签使用小写 ASCII `kebab-case`，构建时拒绝重复标签及与分类同名的标签。

新增 `src/taxonomy.config.ts`，集中定义分类 slug、中文名称、说明和展示顺序。标签无需固定枚举，新增标签不必修改配置。

为全部 Markdown（包括草稿）补齐字段，示例：

```yaml
category: experience
tags: [astro, github-pages, deployment]
```

### 静态页面与组件

新增：

- `src/utils/taxonomy.ts`：分类/标签聚合、计数、过滤和 URL 生成，只统计已发布文章。
- `src/components/TaxonomyLinks.astro`：文章分类与标签链接。
- `src/pages/categories/index.astro`：固定分类总览及文章数。
- `src/pages/categories/[category].astro`：单分类文章列表。
- `src/pages/tags/index.astro`：实际使用标签的总览。
- `src/pages/tags/[tag].astro`：单标签文章列表。

分类和标签列表复用 `PostList.astro`，所有链接继续复用 `withBase()` 与 `getPublishedPosts()`。主导航只增加“分类”和“搜索”；标签入口放在分类总览及文章元信息中，避免移动导航过长。

## 2. 增强文章阅读体验

修改 `src/pages/blog/[...slug].astro`：

- 一次 `render(post)` 同时取得 `Content` 和 `headings`。
- 使用同一已排序文章数组计算相邻文章：上一篇为 `posts[index + 1]`，下一篇为 `posts[index - 1]`。
- 向文章布局传递目录和相邻文章。

新增：

- `src/utils/reading-time.ts`：去除代码块、链接目标和 Markdown 标记后，按中文约 350 字/分钟、英文约 200 词/分钟估算，最少 1 分钟。
- `src/components/TableOfContents.astro`：仅展示 h2/h3，复用 Astro 返回的 heading slug，不自行生成中文锚点。
- `src/components/PostNavigation.astro`：处理首篇和末篇边界。

修改 `PostLayout.astro`，展示分类、标签、约 N 分钟、正文前目录和正文后相邻文章。目录使用独立命名 `nav`，不做滚动监听或当前标题高亮，阅读功能不需要客户端 JavaScript。

为 `getPublishedPosts()` 增加文章 ID 次级排序，保证同日文章顺序稳定。

## 3. 接入 Pagefind 搜索

### 构建与索引

- 添加 `pagefind` 开发依赖并更新锁文件。
- 保留 `build: astro build`，增加 `postbuild: pagefind --site dist`。
- GitHub Actions 继续执行 `npm run build`，索引失败会阻止部署，`dist/pagefind/` 随站点一起上传。

在 `PostLayout.astro`：

- 文章标题添加 `data-pagefind-meta="title"`。
- 仅正文 `.prose` 添加 `data-pagefind-body`，避免索引导航、目录、相邻文章和评论区。

新增 `src/pages/search.astro`：

- 只在该页加载 `/pagefind/pagefind-ui.css` 和 `/pagefind/pagefind-ui.js`，路径通过 `withBase()`。
- 初始化时设置 `baseUrl` 为带仓库前缀的站点根路径，`bundlePath` 为带前缀的 `/pagefind/`，关闭图片并启用标题子结果。
- 开发模式不加载不存在的索引，显示“搜索请在生产构建后预览”；生产构建和预览用于搜索验收。
- 提供无 JavaScript 时的文章、分类和标签入口，不自动聚焦搜索框。

首版不做搜索筛选、搜索弹窗、快捷键或自定义检索状态管理。

## 4. 接入 Giscus 评论

### GitHub 配置

通过浏览器完成以下配置；需要账号授权时由用户操作：

1. 确认 `zhangjunhua/VibeBlog2` 为公开仓库并启用 Discussions。
2. 仅为目标仓库安装 Giscus App。
3. 创建或选择公告类型分类 `Comments`。
4. 从 giscus.app 获取公开的 `repoId` 和 `categoryId`，不使用或保存任何 GitHub Token。

### 页面实现

新增：

- `src/comments.config.ts`：公开评论配置，默认 `enabled: false`。
- `src/components/GiscusComments.astro`：仅在启用且配置完整时渲染。

启用但字段不完整时在构建阶段报错，避免发布无效评论区。评论只接入 `PostLayout.astro`，位于正文和相邻文章区域之外，不影响正文阅读。

使用固定文章 ID 映射：

- `data-mapping="specific"`
- `data-term="blog:${post.id}"`
- `data-strict="1"`

这样评论不受文章标题、本地根路径或 `/VibeBlog2` 影响。其余配置使用中文、亮色主题、懒加载、开启 reaction、关闭 metadata；文章 slug 改名时需要手动迁移对应 Discussion。

## 5. 样式与导航

修改 `BaseLayout.astro` 和 `global.css`：

- 为搜索页提供局部 head 插槽，不让 Pagefind CSS 全站加载。
- 增加分类标签、目录、相邻文章、搜索和评论样式，沿用现有设计变量。
- 小屏导航使用 flex 自然换行，不增加菜单脚本。
- 保持唯一主 h1、跳转正文、可见焦点和当前导航状态。
- 为文章标题设置 `scroll-margin-top`，确保目录锚点不会遮挡标题。

## 关键现有文件

- `src/content.config.ts`：文章 schema。
- `src/utils/posts.ts`：唯一公开文章入口、排序及文章 URL。
- `src/utils/paths.ts`：统一 base 路径处理，保持不变。
- `src/pages/blog/[...slug].astro`：目录数据与相邻文章数据流。
- `src/layouts/PostLayout.astro`：阅读功能、索引标记与评论接入点。
- `src/layouts/BaseLayout.astro`：导航与搜索页资源插槽。
- `src/components/PostList.astro`：聚合页直接复用。
- `package.json` / `package-lock.json`：Pagefind 与 postbuild。
- `.github/workflows/deploy.yml`：现有构建发布流程保持不变。

## 验证与验收

### 静态检查

1. 对变更文件执行 Prettier，并运行 `format:check`、`astro check` 和生产构建。
2. 验证所有公开文章、分类、标签、目录和相邻链接正确；同日文章顺序稳定。
3. 确认草稿不出现在文章页、分类、标签、相邻文章、搜索、RSS 或 sitemap。
4. 确认 RSS 只包含文章，sitemap 自动包含新增公开页面。

### 本地浏览器

分别验证根路径和 `/VibeBlog2/` 子路径：

- 分类和标签计数、列表及深层 URL 正常。
- h2/h3 目录锚点准确，阅读时长显示合理，首篇和末篇无错误相邻链接。
- 搜索“静态网站”等正文词语能命中；搜索草稿标题无结果；标题和子标题结果均保留仓库前缀。
- 页面不存在对根路径 `/pagefind/...` 的错误请求。
- 在约 320px、768px 和桌面视口检查导航换行、正文、目录和搜索，无横向滚动。
- 使用键盘完成导航、目录跳转、搜索及打开结果，焦点清晰。

### 评论与线上回归

1. 未启用评论时，不渲染评论容器或外部脚本。
2. 启用后，仅文章详情加载 Giscus；首页、分类和搜索页不加载。
3. 在线上文章页创建首条测试 Discussion，确认 `blog:<post.id>` 映射、反应和评论框正常。
4. 推送后确认 Actions 的构建、Pagefind 索引和 Pages 部署成功，再回归线上搜索与深层文章链接。

## 明确边界

本轮不做标签分页、搜索筛选、目录 scrollspy、深色模式、前端评论管理、自建评论后端、导航菜单脚本或 MDX。后续根据真实使用情况独立迭代。
