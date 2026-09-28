# Astro 文件型博客

一个由 Obsidian 兼容 Markdown 文件生成的静态博客。你可以在 Obsidian 或任意文本编辑器中写作，再由 Astro 生成可部署的 HTML 网站。

## 这个项目做什么

```text
Markdown 笔记 -> Astro -> 静态网站
```

项目没有本地写作页面、数据库、草稿状态或附件管理器。`src/content/posts/` 下的每个 Markdown 文件在构建时都会进入公开网站。未公开或私人的笔记请放在这个目录之外。

## 内容格式

每篇文章是一个 `.md` 文件。文件路径决定公开 URL。YAML frontmatter 可省略：

```text
src/content/posts/入门.md  ->  /posts/%E5%85%A5%E9%97%A8/
```

如果提供 frontmatter，其中的标题和日期会覆盖文件名和文件创建日期；分类和标签可选：

```md
---
title: 入门
date: 2026-09-28
category: 笔记
tags:
  - obsidian
  - markdown
---

在这里写文章正文。
```

文件夹路径会保留，每段路径会转换为 URL slug。例如，`src/content/posts/笔记/第一篇.md` 对应 `/posts/笔记/第一篇/`。首页和文章列表按文件创建日期倒序显示；文件名只决定 URL。已提交笔记使用首次加入 Git 的提交日期，未提交笔记使用文件系统创建日期。CI 会拉取完整 Git 历史，因此构建检出代码后顺序仍然稳定。重命名文件会改变公开 URL，也要同步修改引用它的双链。

没有 frontmatter 时，标题直接取原始文件名，即使有多篇同名笔记也一样。列表显示笔记的创建日期，并按日期倒序排列。

## Obsidian Markdown

Astro 支持标准 Markdown 和 GitHub Flavored Markdown。本项目额外支持这些 Obsidian 语法：

- 笔记双链和别名：`[[入门]]`、`[[入门#准备工作|准备工作]]`，也支持 `[准备工作](入门.md#准备工作)`
- `[[笔记名]]` 仅在全项目中该笔记名唯一时有效。同名文件必须用文件夹路径区分，例如 `[[项目/笔记]]`；含糊的短链会让构建报错，不会静默链接到错误文章。
- Callout 提示框：`> [!tip] 提示标题`
- 高亮：`==重点内容==`
- 数学公式：`$x^2$` 和 `$$...$$`
- 任务列表及 Obsidian 状态标记，例如 `[/]`
- 行内标签：`#阅读/待办`
- 注释：`%%不会出现在公开页面%%`
- YAML frontmatter 属性

`![[...]]` 文件嵌入和本地文章图片不会被处理。文章目录只放 Markdown 笔记；仍可使用标准 Markdown 链接和外部图片地址。

## 项目结构

```text
src/content/posts/  发布到网站的 Markdown 笔记
src/pages/          静态页面、归档、RSS 和 sitemap
src/components/     共用页面组件
src/site-settings.json  网站文案、语言、主题和字体
public/             原样提供给浏览器的静态文件
```

## 本地预览

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:4321/`。在 Obsidian 中编辑 `.md` 文件后刷新页面即可预览。

## 网站设置

编辑 `src/site-settings.json` 可修改网站文案、语言、颜色、背景和字体。网站设置与文章内容分开保存。

## 检查和构建

```bash
pnpm check
pnpm build
pnpm preview
```

`pnpm build` 会把静态网站写入 `dist/`；`pnpm preview` 可在本地查看构建结果。

## 部署

可部署到任意静态托管服务，设置如下：

```text
Build command: pnpm build
Output folder: dist
```
