# Astro 文件型博客模板

这是一个静态博客模板，适合想要长期保存内容、但不想一开始就使用数据库的人。

视觉想法来自经典 livedoor 风格博客：清楚的博客标题、简短简介、朴素导航、归档、分类、标签、侧边栏，以及以文章为中心的布局。这只是灵感来源，不复制 livedoor 的代码或品牌。

英文主文档：[README.md](./README.md)

## 这个项目是什么

这个项目把本地文件变成网站。

```text
Markdown 文件       -> 博客文章
public 图片文件夹   -> 图片和附件
Astro              -> 生成 HTML 页面
静态托管平台        -> 发布生成后的网站
```

当前版本没有数据库，也没有远程后台服务器。`/admin/` 是一个本地写作工具：浏览器获得文件夹授权后，它会直接把 Markdown 和附件写进这个项目。

推荐写作入口是：

```text
http://localhost:4321/admin/
```

命令行工具保留给高级用法和自动化。

## 项目结构

重要目录是：

```text
src/pages/              Astro 页面：首页、归档页、管理页、RSS
src/content/posts/      Markdown 文章文件
public/images/posts/    每篇文章自己的附件目录
public/images/site/     全站图片，例如头图或背景图
src/site-settings.json  全部站点文案、主题、语言和字体设置
src/site.config.ts      读取 site-settings.json 的 TypeScript 包装文件
src/content-workflow.ts /admin/ 和 CLI 共用的文章规则
```

一篇正式文章对应：

```text
src/content/posts/{postId}.md
public/images/posts/{postId}/
```

`postId` 是稳定身份。不要把标题或 URL slug 当成稳定身份。

## 安装和启动

安装依赖：

```bash
npm install
```

启动本地开发服务器：

```bash
npm run dev
```

打开公开网站：

```text
http://localhost:4321
```

打开本地写作管理页：

```text
http://localhost:4321/admin/
```

`/admin/` 依赖浏览器 File System Access API，建议使用 Chrome 或 Edge。

预览正式构建结果：

```bash
npm run build
npm run preview
```

`npm run dev` 用于日常编辑。`npm run build` 用于检查并生成 `dist/`。`npm run preview` 用于预览已经生成的 `dist/`。

## 站点文案、语言和主题

所有用户可编辑的站点配置集中在一个 JSON 文件中：

```text
src/site-settings.json
```

`src/site.config.ts` 是一个薄 TypeScript 包装，读取这个 JSON 并为其他代码提供类型化的辅助导出。通常你只需要编辑 JSON 文件。

### 语言

```json
"defaultLocale": "en",
"supportedLocales": ["en", "zh-CN"]
```

如果要让站点/admin/CLI 显示中文，把 `defaultLocale` 改成 `"zh-CN"`。这只是文案层面的多语言，还不是完整的多语言文章路由。

要添加新语言，在 JSON 的 `copy` 下新增一个 key 并填入全部翻译，然后在 `supportedLocales` 和 `dateLocales` 中各加一行。

### 站点信息

```json
"copy": {
  "en": {
    "site": {
      "title": "File-Based Astro Blog",
      "description": "A quiet static blog template powered by Markdown files.",
      "footer": "Built with Astro. Deployable to any static hosting platform."
    }
  },
  "zh-CN": {
    "site": {
      "title": "文件型 Astro 博客",
      "description": "一个由 Markdown 文件驱动的朴素静态博客模板。",
      "footer": "由 Astro 生成，可部署到任何静态托管平台。"
    }
  }
}
```

### 主题 — 背景和颜色

```json
"theme": {
  "bodyBackgroundImage": "/images/site/body.jpg",
  "siteBackgroundImage": "",
  "headerBackgroundImage": "/images/site/header.jpg",
  "headerMinHeight": "160px",
  "headerTextColor": "#111111",
  "headerDescriptionColor": "#555555"
}
```

空字符串表示不使用图片，或回退到 CSS 默认值。

### 主题 — 字体

```json
"theme": {
  "typography": {
    "fontFamily": "Georgia, serif",
    "baseFontSize": "16px",
    "lineHeight": "1.7",
    "headingFontFamily": "",
    "headingFontWeight": "700",
    "codeFontFamily": "Menlo, monospace"
  }
}
```

每个字体字段接受任意有效的 CSS 值。空字符串表示使用 CSS 内置默认值。

修改 `site-settings.json` 后，Astro 开发服务器会检测文件变动并热更新页面，可以即时预览效果。

你也可以通过以下方式编辑设置：

- **Admin 界面**：打开 `/admin/`，点击 **Settings** 标签页，使用可视化编辑器并带有实时 iframe 预览。
- **CLI 命令行**：`npm run site-config`（交互式）或 `npm run site-config -- --flag value`（直接设置）。

CSS 在：

```text
src/styles.css
```

进一步定制时的常用选择器：

```css
body
.site
.header
.blog-title
.blog-description
```

文章封面图在每篇文章里设置：

```md
cover: "/images/posts/{postId}/cover.jpg"
```

## 在 /admin/ 创建第一篇文章

1. 运行 `npm run dev`。
2. 用 Chrome 或 Edge 打开 `http://localhost:4321/admin/`。
3. 点击 `Choose Project Folder`。
4. 选择项目根目录，也就是包含 `package.json` 的文件夹。
5. 点击 `New Post`。

点击 `New Post` 时，admin 会立刻做三件事：

```text
1. 生成随机 postId UUID
2. 创建 src/content/posts/{postId}.md
3. 创建 public/images/posts/{postId}/
```

新文章默认是草稿：

```md
draft: true
```

草稿不会出现在公开网站、归档页、分类页、标签页、RSS 或 sitemap。

准备发布时，在 `/admin/` 取消草稿勾选，或把 Markdown frontmatter 改成：

```md
draft: false
```

## 在 /admin/ 编辑文章

1. 打开 `/admin/`。
2. 点击 `Choose Project Folder`。
3. 在文章列表中点击一篇文章。
4. 修改 frontmatter 字段。
5. 修改 Markdown 正文。
6. 写作时查看实时预览。
7. 点击 `Save Post`。

admin 编辑的是普通 Markdown 文件。内容没有藏在数据库里。

## 在 /admin/ 上传附件

附件属于某一篇文章，所以必须先有文章，才能上传附件。

这就是为什么你还没有新建或选中文章时，上传控件是禁用的。正常情况下不会出现"没有 UUID 但要上传附件"的状态。

选中文章后：

1. 在 Assets 区域选择文件。
2. 选择图片或其他附件。
3. 可选勾选 `Convert supported images to WebP`。
4. 可选勾选 `Strip metadata from supported images`。
5. 点击 `Upload To Asset Folder`。
6. 文件会复制到 `public/images/posts/{postId}/`。
7. 点击附件旁边的 `Insert`，插入这样的 Markdown：

```md
![image-name.jpg](/images/posts/{postId}/image-name.jpg)
```

处理规则：

```text
静态 JPEG/PNG/WebP   可以转换或重新编码
其他文件类型          保持原样复制
```

如果启用 WebP 转换，上传后的文件名会改成 `.webp`，插入的 Markdown 路径也会使用新的文件名。

实现说明：

```text
/admin/ 使用浏览器端图片处理，所以在静态托管上也能继续工作
CLI add-assets 使用本地 sharp 提供同样的两个选项
```

项目的内容模型仍然保持为 Markdown 文件加附件目录。这样以后如果要从本地文件访问升级到云端对象存储或数据库后台，也不用先改文章和附件的组织方式。

Markdown 路径里不要写 `public`。公开文件都从网站根路径引用。

## Markdown 和 frontmatter

每篇文章是一个 `.md` 文件。文件开头两个 `---` 之间是 frontmatter，也就是元信息；后面才是正文。

例子：

```md
---
postId: "b6a1c0a6-3df8-4f6a-9e9a-44e08c1b9b42"
slug: "my-first-post"
title: "My First Post"
description: "A short summary."
date: 2026-04-28
updated: 2026-04-28
category: "Notes"
tags:
  - astro
  - markdown
author: "Author"
assetDir: "/images/posts/b6a1c0a6-3df8-4f6a-9e9a-44e08c1b9b42/"
cover: "/images/posts/b6a1c0a6-3df8-4f6a-9e9a-44e08c1b9b42/cover.jpg"
draft: true
---

正文写在这里。
```

可以修改：

```text
slug、title、description、date、updated、category、tags、author、cover、draft、正文
```

尽量不要修改：

```text
postId、Markdown 文件名、附件目录名
```

参考文件是：

```text
src/content/posts/_draft-template.md
```

它只是参考，默认不会发布，因为它有 `draft: true`。如果你临时改成 `draft: false`，它会出现在：

```text
/posts/draft-template/
```

如果只想保留为参考，请再改回 `draft: true`。

## postId 和 slug

`postId` 是随机 UUID。创建文章时生成。它用于：

```text
Markdown 文件名
附件目录
assetDir
```

`slug` 是公开 URL 的一部分：

```text
/posts/{slug}/
```

标题改变后，slug 可以跟着重新生成。在 `/admin/` 点击 `Regenerate Slug`。在命令行运行：

```bash
npm run update-slug
```

本项目不保存旧 slug。如果 slug 变了，旧 URL 不会自动跳转，除非你自己添加 redirect。

中文标题不会自动转拼音。如果想要可读 URL，建议手写英文或拼音 slug。否则会回退到：

```text
post-{postId前8位}
```

## 导航和自动生成页面

顶部导航不是写在 Markdown 里。它由这里生成：

```text
src/site-settings.json       导航文字
src/components/Header.astro  头部结构和链接
```

默认导航文字在 `copy.en.nav`：

```ts
nav: {
  home: 'Home',
  archives: 'Archives',
  categories: 'Categories',
  tags: 'Tags',
  about: 'About',
  admin: 'Admin',
  rss: 'RSS'
}
```

对应路由是：

```text
Home        /                 src/pages/index.astro
Archives    /archives/        src/pages/archives.astro
Categories  /categories/      src/pages/categories.astro
Tags        /tags/            src/pages/tags.astro
About       /about/           src/pages/about.astro
Admin       /admin/           src/pages/admin.astro
RSS         /rss.xml          src/pages/rss.xml.js
```

自动生成页面读取已发布 Markdown 文章：

```text
/archives/              读取所有已发布文章的 date
/archives/{year}/{mm}/  列出这个年月的文章
/categories/            读取所有已发布文章的 category
/category/{category}/   列出这个分类下的文章
/tags/                  读取所有已发布文章的 tags
/tag/{tag}/             列出包含这个 tag 的文章
```

例如：

```md
date: 2026-04-28
category: "Notes"
tags:
  - astro
  - markdown
draft: false
```

这篇文章会出现在：

```text
/archives/2026/04/
/category/Notes/
/tag/astro/
/tag/markdown/
```

`/about/` 不读取文章。它读取 `src/site.config.ts` 里的：

```ts
about: {
  title: 'About This Site',
  paragraphs: [...],
  principlesTitle: 'Design Principles',
  principles: [...]
}
```

## RSS

RSS 地址是：

```text
/rss.xml
```

源文件是：

```text
src/pages/rss.xml.js
```

RSS 通过这里读取已发布文章：

```text
src/lib.ts -> getPublishedPosts()
```

`getPublishedPosts()` 读取这里定义的 Astro content collection：

```text
src/content.config.ts
```

这个 collection 读取：

```text
src/content/posts/**/*.{md,mdx}
```

RSS 只包含：

```md
draft: false
```

RSS 是由 `@astrojs/rss` 生成的 RSS 2.0 XML。

每篇文章会变成一个 `<item>`：

```text
item title        <- 文章 frontmatter 的 title
item description  <- 文章 frontmatter 的 description
item pubDate      <- 文章 frontmatter 的 date
item link         <- /posts/{slug}/
```

RSS 顶部频道信息：

```xml
<title>File-Based Astro Blog</title>
<description>A quiet static blog template powered by Markdown files.</description>
<link>https://your-domain.com/</link>
```

来自两个地方：

```text
<title>        src/site-settings.json -> copy.zh-CN.site.title
<description>  src/site-settings.json -> copy.zh-CN.site.description
<link>         astro.config.mjs -> site
```

部署前请修改：

```js
export default defineConfig({
  site: 'https://your-domain.com',
  output: 'static'
});
```

本地查看 RSS：运行 `npm run dev`，然后打开：

```text
http://localhost:4321/rss.xml
```

## 附件目录

内置图片目录有两类：

```text
public/images/posts/{postId}/  某一篇文章自己的附件
public/images/site/            全站图片
```

`public/images/posts/{postId}/` 用于文章图片、下载文件、截图、扫描件、文章封面图。

`public/images/site/` 用于全站共用图片，例如：

```text
public/images/site/header.jpg
public/images/site/body.jpg
```

当前模板不会默认创建日期文件夹。归档页来自 frontmatter 的 `date`，不是来自真实文件夹。

如果你想按日期整理附件，可以在某篇文章附件目录里建子文件夹：

```text
public/images/posts/{postId}/2026-04-28/photo.jpg
```

这个文件仍然通过 `postId` 和文章关联。

## 提示文案配置

所有提示文案和说明文字统一配置在 [`src/site-settings.json`](./src/site-settings.json) 中。

这个文件的 `copy` 键下同时包含中英文两套文案：

```json
"copy": {
  "en": { ... },
  "zh-CN": { ... }
}
```

首页提示文案的配置项是：

```json
copy.en.home.notice
copy['zh-CN'].home.notice
```

将字段值设置为空字符串即可隐藏对应提示块：

```json
"notice": ""
```

以下字段也支持用同样方式隐藏：

```text
copy.en.site.description
copy['zh-CN'].site.description

copy.en.site.footer
copy['zh-CN'].site.footer

copy.en.sidebar.aboutTitle
copy['zh-CN'].sidebar.aboutTitle

copy.en.sidebar.aboutText
copy['zh-CN'].sidebar.aboutText

copy.en.home.notice
copy['zh-CN'].home.notice

copy.en.admin.intro
copy['zh-CN'].admin.intro

copy.en.admin.rootHelp
copy['zh-CN'].admin.rootHelp

copy.en.admin.assetHintBeforePost
copy['zh-CN'].admin.assetHintBeforePost
```

说明：

1. 中文和英文分别配置；如果两种语言都需要隐藏，需要同时清空两边的字段。
2. 按钮文字、导航名称、表单字段名、状态提示也定义在 `site-settings.json` 中，但这些文案属于界面的一部分，不建议隐藏。
3. 这些字段也可以通过 **Admin Settings 标签页**（`/admin/` → Settings）或 **CLI**（`npm run site-config -- --notice-zh ""`）来编辑，不必直接修改 JSON 文件。

## CLI 命令

```bash
npm run dev           # 本地开发服务器
npm run build         # 检查并生成 dist/
npm run preview       # 预览 dist/
npm run new-post      # 新建草稿文章和附件目录
npm run edit-post     # 打开 Markdown 文章
npm run update-slug   # 根据标题重新生成 slug
npm run preview-post  # 把某篇文章渲染到 .post-preview/
npm run open-assets   # 打开或打印文章附件目录
npm run add-assets    # 把文件复制到文章附件目录
npm run site-config   # 查看或修改站点设置（交互式或 --flags）
npm run site-assets   # 把文件复制到 public/images/site/
```

例子：

```bash
npm run edit-post -- 1
npm run update-slug -- my-post
npm run preview-post -- my-post --no-open
npm run open-assets -- my-post --print
npm run add-assets -- my-post ./cover.jpg
npm run add-assets -- my-post ./cover.jpg --webp
npm run add-assets -- my-post ./cover.jpg ./photo.png --strip-metadata
npm run add-assets -- my-post ./cover.jpg ./scan.png --webp --strip-metadata
npm run site-config -- --lang zh-CN
npm run site-config -- --bg-header /images/site/header.jpg --font-family "Georgia, serif"
npm run site-assets -- ./bg.jpg --webp
```

`add-assets` 选项：

```text
--webp             将支持的静态 JPEG/PNG/WebP 图片转换为 .webp
--strip-metadata   将支持的静态 JPEG/PNG/WebP 图片重新编码并去掉 metadata
```

不是静态 JPEG、PNG、WebP 的文件会按原样复制。

`site-assets` 以同样方式工作，但目标目录是 `public/images/site/`，用于站点全局图片（背景图、头图等）。

`site-config` 可以交互式使用（`npm run site-config`）或者带参数直接设置：

```bash
npm run site-config -- --show                # 打印当前设置
npm run site-config -- --lang zh-CN          # 切换语言
npm run site-config -- --bg-header URL       # 设置头部背景
npm run site-config -- --font-family FONT    # 设置字体
```

所有站点设置也可以在 `/admin/` 的 Settings 标签页中可视化编辑，并带有实时 iframe 预览。

实现说明：

```text
CLI 处理走本地 sharp
/admin/ 处理走浏览器 API，以保持静态托管可用
```

## 部署

构建命令：

```bash
npm run build
```

输出目录：

```text
dist/
```

通用静态托管配置：

```text
Install command: npm install
Build command:   npm run build
Output folder:   dist
```

部署到根域名：

```js
export default defineConfig({
  site: 'https://your-domain.com',
  output: 'static'
});
```

部署到 GitHub Pages 项目站点：

```js
export default defineConfig({
  site: 'https://your-name.github.io',
  base: '/repo-name',
  output: 'static'
});
```

用户或组织 GitHub Pages 主页通常不需要 `base`。

## 未来扩展

当前存储方式：

```text
/admin/ -> File System Access API -> 本地 Markdown 和附件
```

本地存储边界在：

```text
src/admin/local-file-storage.js
```

以后可以增加 API、数据库、对象存储或 Git-backed CMS 适配器。当前模板保留这个方向，但还没有实现云端存储。
