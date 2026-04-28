export const siteConfig = {
  templateName: 'astro-file-blog-template',
  defaultLocale: 'en',
  supportedLocales: ['en', 'zh-CN'],
  theme: {
    bodyBackgroundImage: '',
    siteBackgroundImage: '',
    headerBackgroundImage: '',
    headerMinHeight: '120px',
    headerTextColor: '',
    headerDescriptionColor: ''
  },
  dateLocales: {
    en: 'en-US',
    'zh-CN': 'zh-CN'
  },
  copy: {
    en: {
      site: {
        title: 'File-Based Astro Blog',
        description: 'A quiet static blog template powered by Markdown files.',
        footer: 'Built with Astro. Deployable to any static hosting platform.'
      },
      nav: {
        home: 'Home',
        archives: 'Archives',
        categories: 'Categories',
        tags: 'Tags',
        about: 'About',
        admin: 'Admin',
        rss: 'RSS'
      },
      home: {
        title: 'Latest Posts',
        notice: 'Use /admin/ as the recommended local writing interface. Posts are Markdown files, assets live beside each postId folder.',
        empty: 'No published posts yet.'
      },
      about: {
        title: 'About This Site',
        paragraphs: [
          'This is an Astro static blog template for long-lived personal or project writing.',
          'It keeps content portable: Markdown is the post database, public image folders are the asset library, and Astro generates the final website.'
        ],
        principlesTitle: 'Design Principles',
        principles: [
          'Plain files first',
          'Readable archive, category, and tag pages',
          'No database required',
          'A local admin UI for writing and previewing posts',
          'Clear extension points for future cloud storage or multilingual content'
        ]
      },
      sidebar: {
        aboutTitle: 'About',
        aboutText: 'A file-based static blog: simple, fast, and easy to migrate.',
        recentPosts: 'Recent Posts',
        categories: 'Categories',
        tags: 'Tags',
        archives: 'Archives'
      },
      labels: {
        published: 'Published',
        updated: 'Updated',
        category: 'Category',
        tag: 'Tag',
        archive: 'Archive',
        draft: 'Draft',
        live: 'Published'
      },
      pages: {
        archivesTitle: 'Monthly Archives',
        categoriesTitle: 'Categories',
        tagsTitle: 'Tags'
      },
      contentDefaults: {
        untitledDraft: 'Untitled Draft',
        unnamedPost: 'Untitled Post',
        category: 'Uncategorized',
        author: 'Author',
        body: '## Section Heading\n\nStart writing your post here.\n'
      },
      admin: {
        pageTitle: 'Post Admin',
        intro: 'Local writing workspace for creating Markdown posts, editing frontmatter, uploading assets, regenerating slugs, and previewing the body.',
        pickRoot: 'Choose Project Folder',
        refreshPosts: 'Refresh Posts',
        rootInitial: 'No project folder selected',
        rootHelp: 'Choose the project root that contains src/, public/, and package.json. This uses the browser File System Access API and works best in Chrome or Edge on localhost.',
        newPost: 'New Post',
        savePost: 'Save Post',
        regenerateSlug: 'Regenerate Slug',
        listTitle: 'Posts',
        listEmptyBeforeRoot: 'Choose the project folder to load posts.',
        listEmpty: 'No posts yet. Create a new post to begin.',
        fieldsTitle: 'Frontmatter',
        bodyTitle: 'Body',
        bodyPlaceholder: 'Write Markdown here',
        assetsTitle: 'Assets',
        uploadAssets: 'Upload To Asset Folder',
        assetHintBeforePost: 'Select or create a post before uploading assets.',
        fieldLabels: {
          title: 'Title',
          description: 'Description',
          date: 'Publish Date',
          updated: 'Updated Date',
          category: 'Category',
          tags: 'Tags, comma separated',
          author: 'Author',
          cover: 'Cover Path',
          assetDir: 'Asset Directory',
          draft: 'Draft, do not publish'
        },
        unsupportedBrowser: 'This browser cannot write local folders. Use Chrome or Edge.',
        reconnectRoot: 'Reconnect Project Folder',
        restoringRoot: 'Restoring last project folder...',
        rootRestored: 'Restored:',
        rootReconnectHint: 'Last project folder remembered. Click Reconnect Project Folder to restore access.',
        rootRestoreFailed: 'Could not restore the last project folder automatically.',
        rootSelected: 'Selected:',
        rootFailed: 'Selection failed:',
        opened: 'Opened:',
        created: 'Created draft and asset folder.',
        saved: 'Saved. Astro will refresh the local site automatically.',
        slugUpdated: 'Slug regenerated from the title. Save the post to keep it.',
        assetHint: 'Asset folder:',
        insertAsset: 'Insert',
        assetUploaded: 'Assets uploaded.',
        chooseRootError: 'Choose a project folder first.'
      },
      cli: {
        prompts: {
          title: 'Post title (optional, can change later): ',
          slug: 'URL slug (optional, can regenerate later): ',
          category: 'Category (default: Uncategorized): ',
          tags: 'Tags, comma separated (optional): ',
          description: 'Description (optional): ',
          author: 'Author (default: Author): ',
          publish: 'Publish now? Type y to publish, Enter to keep as draft: ',
          selectPost: 'Enter number or keyword: '
        },
        messages: {
          noPosts: 'No posts yet. Run:',
          editablePosts: 'Editable posts:',
          usageEdit: 'Please provide a number or keyword, for example:',
          notFound: 'No matching post found.',
          tooMany: 'Multiple posts matched. Use a more specific keyword or number:',
          opening: 'Opening:',
          openFailed: 'Could not open it automatically. Open this path manually:',
          assetFolder: 'Asset folder:',
          createdPost: 'Created post:',
          createdAssets: 'Created asset folder:',
          postId: 'postId:',
          currentSlug: 'Current slug:',
          skippedNoTitle: 'Skipped because it has no title:',
          noSlugChange: 'No slug change:',
          updatedSlug: 'Updated slug:',
          noSlugUpdates: 'No slug updates were needed.',
          copiedAsset: 'Copied asset:',
          markdownPath: 'Markdown path:',
          previewCreated: 'Preview created:',
          openingPreview: 'Opening preview:',
          usageAddAssets: 'Usage: npm run add-assets -- <post-number-or-keyword> <file...>',
          usagePreview: 'Usage: npm run preview-post -- <post-number-or-keyword> [--no-open]',
          usageOpenAssets: 'Usage: npm run open-assets -- <post-number-or-keyword> [--print]'
        },
        postComment: {
          stableId: 'Stable postId:',
          identity: 'The Markdown file and asset folder use postId. You can change title, category, tags, description, and slug later.',
          keepStable: 'Avoid changing postId, the Markdown filename, or the asset folder name unless you also move the linked assets.',
          assetFolder: 'Asset folder already created:',
          cover: 'Cover example:',
          image: 'Image Markdown example:',
          slugTip: 'After changing the title, run npm run update-slug to regenerate the slug.',
          draftTip: 'When ready to publish, change draft: true to draft: false.',
          publishedTip: 'This post is draft: false and will appear on public pages.'
        }
      }
    },
    'zh-CN': {
      site: {
        title: '文件型 Astro 博客',
        description: '一个由 Markdown 文件驱动的朴素静态博客模板。',
        footer: '由 Astro 生成，可部署到任何静态托管平台。'
      },
      nav: {
        home: '首页',
        archives: '归档',
        categories: '分类',
        tags: '标签',
        about: '关于',
        admin: '管理',
        rss: 'RSS'
      },
      home: {
        title: '最新文章',
        notice: '推荐使用 /admin/ 作为本地写作入口。文章是 Markdown 文件，附件跟随每篇文章的 postId 文件夹。',
        empty: '暂无已发布文章。'
      },
      about: {
        title: '关于本站',
        paragraphs: [
          '这是一个适合长期个人记录或项目记录的 Astro 静态博客模板。',
          '它把内容保持为可迁移的普通文件：Markdown 是文章数据库，public 图片目录是附件库，Astro 负责生成最终网站。'
        ],
        principlesTitle: '设计原则',
        principles: [
          '普通文件优先',
          '清晰的归档、分类和标签页',
          '不需要数据库',
          '提供本地图形化写作和预览入口',
          '为未来云端存储和多语言内容保留扩展边界'
        ]
      },
      sidebar: {
        aboutTitle: '关于',
        aboutText: '一个文件型静态博客：简单、快速、容易迁移。',
        recentPosts: '最近文章',
        categories: '分类',
        tags: '标签',
        archives: '归档'
      },
      labels: {
        published: '发布',
        updated: '更新',
        category: '分类',
        tag: '标签',
        archive: '归档',
        draft: '草稿',
        live: '发布'
      },
      pages: {
        archivesTitle: '月份归档',
        categoriesTitle: '分类',
        tagsTitle: '标签'
      },
      contentDefaults: {
        untitledDraft: '未命名草稿',
        unnamedPost: '未命名文章',
        category: '未分类',
        author: '作者',
        body: '## 小标题\n\n正文从这里开始写。\n'
      },
      admin: {
        pageTitle: '文章管理',
        intro: '用于本地写作：新建 Markdown、编辑 frontmatter、上传附件、重新生成 slug，并实时预览正文。',
        pickRoot: '选择项目文件夹',
        refreshPosts: '刷新文章',
        rootInitial: '尚未选择项目文件夹',
        rootHelp: '请选择包含 src/、public/、package.json 的项目根目录。这个功能依赖浏览器 File System Access API，建议在本地开发地址中使用 Chrome 或 Edge。',
        newPost: '新建文章',
        savePost: '保存文章',
        regenerateSlug: '重新生成 slug',
        listTitle: '文章列表',
        listEmptyBeforeRoot: '选择项目文件夹后显示文章。',
        listEmpty: '还没有文章。点击新建文章开始。',
        fieldsTitle: '文章属性',
        bodyTitle: '正文',
        bodyPlaceholder: '正文 Markdown 写在这里',
        assetsTitle: '附件',
        uploadAssets: '上传到附件目录',
        assetHintBeforePost: '先选择或新建文章，再上传附件。',
        fieldLabels: {
          title: '标题',
          description: '摘要',
          date: '发布日期',
          updated: '更新时间',
          category: '分类',
          tags: '标签，用逗号分隔',
          author: '作者',
          cover: '封面路径',
          assetDir: '附件目录',
          draft: '草稿，不发布'
        },
        unsupportedBrowser: '当前浏览器不支持本地文件夹写入，请使用 Chrome 或 Edge。',
        reconnectRoot: '重新连接项目文件夹',
        restoringRoot: '正在恢复上次的项目文件夹...',
        rootRestored: '已恢复：',
        rootReconnectHint: '已记住上次的项目文件夹。点击“重新连接项目文件夹”即可恢复访问权限。',
        rootRestoreFailed: '无法自动恢复上次的项目文件夹。',
        rootSelected: '已选择：',
        rootFailed: '选择失败：',
        opened: '已打开：',
        created: '已创建草稿和附件目录。',
        saved: '已保存。Astro 会自动刷新本地页面。',
        slugUpdated: 'slug 已根据标题更新，记得保存文章。',
        assetHint: '附件目录：',
        insertAsset: '插入',
        assetUploaded: '附件已上传。',
        chooseRootError: '请先选择项目文件夹。'
      },
      cli: {
        prompts: {
          title: '文章标题（可留空，之后再改）：',
          slug: 'URL 短名 slug（可留空自动生成，之后可更新）：',
          category: '分类（默认：未分类）：',
          tags: '标签，用逗号分隔（可留空）：',
          description: '摘要（可留空）：',
          author: '作者（默认：作者）：',
          publish: '现在发布？输入 y 发布，直接回车保存为草稿：',
          selectPost: '输入编号或关键词：'
        },
        messages: {
          noPosts: '现在还没有文章。先运行：',
          editablePosts: '可编辑文章：',
          usageEdit: '请指定编号或关键词，例如：',
          notFound: '没有找到匹配的文章。',
          tooMany: '匹配到多篇文章，请用更具体的关键词或编号：',
          opening: '正在打开：',
          openFailed: '没有成功自动打开，请手动打开：',
          assetFolder: '附件目录：',
          createdPost: '已创建文章：',
          createdAssets: '已创建附件目录：',
          postId: 'postId：',
          currentSlug: '当前 slug：',
          skippedNoTitle: '跳过，因为没有 title：',
          noSlugChange: '无需更新：',
          updatedSlug: '已更新 slug：',
          noSlugUpdates: '没有需要更新的 slug。',
          copiedAsset: '已复制附件：',
          markdownPath: 'Markdown 路径：',
          previewCreated: '已创建预览：',
          openingPreview: '正在打开预览：',
          usageAddAssets: '用法：npm run add-assets -- <文章编号或关键词> <文件...>',
          usagePreview: '用法：npm run preview-post -- <文章编号或关键词> [--no-open]',
          usageOpenAssets: '用法：npm run open-assets -- <文章编号或关键词> [--print]'
        },
        postComment: {
          stableId: '稳定 postId：',
          identity: '文章文件和附件目录都使用 postId。以后标题、分类、标签、摘要和 slug 都可以改。',
          keepStable: '不建议随便改 postId、Markdown 文件名或附件目录名，除非你也一起移动关联附件。',
          assetFolder: '附件目录已经创建：',
          cover: '封面示例：',
          image: '正文图片示例：',
          slugTip: '标题改好后，可以运行 npm run update-slug 重新生成 slug。',
          draftTip: '写完准备发布时，把 draft: true 改成 draft: false。',
          publishedTip: '这篇文章已经是 draft: false，会出现在正式页面里。'
        }
      }
    }
  }
} as const;

export type SupportedLocale = keyof typeof siteConfig.copy;

export const activeLocale = siteConfig.defaultLocale as SupportedLocale;
export const copy = siteConfig.copy[activeLocale];
export const contentDefaults = copy.contentDefaults;
export const dateLocale = siteConfig.dateLocales[activeLocale] ?? activeLocale;

export function getCopy(locale: SupportedLocale = activeLocale) {
  return siteConfig.copy[locale];
}
