# Audit: AstroWind

## 1. Astro version and dependencies

- **Astro**: 5.12.9
- **Framework integrations**: None (pure Astro, no React/Vue/Svelte)
- **CSS**: Tailwind CSS 3.4.17 via `@astrojs/tailwind`
- **Markdown**: `@astrojs/mdx` 4.3.3, custom remark plugin (`readingTimeRemarkPlugin`), custom rehype plugins (`responsiveTablesRehypePlugin`, `lazyImagesRehypePlugin`)
- **Package manager**: npm (lockfile present)
- **Node**: `^18.17.1 || ^20.3.0 || >= 21.0.0`
- **Other notable deps**: `astro-icon` 1.1.5, `astro-compress` 2.3.8, `astro-embed` 0.9.0, `sharp` 0.34.3

## 2. Content collections

### `post`
- **Loader**: `glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' })`
- **6 files**: 4 `.md` + 2 `.mdx`
- **Schema**: title (required), publishDate, updateDate, draft, excerpt, image, category, tags, author, metadata
- **Consumed by**: `getCollection('post')` in `src/utils/blog.ts` helper functions
- **Body content**: Rendered on individual post pages

### Data files (outside collections)
- `src/config.yaml` — site settings consumed by vendor integration (`astrowind:config`)
- `src/navigation.ts` — TypeScript file with `headerData` and `footerData` exports using URL helper functions

## 3. Pages and routing

### Static pages (17 marketing pages with hardcoded widget data)
| Page | Layout | Widgets used |
|---|---|---|
| `index.astro` | PageLayout | Hero, Note, Features, Content×3, Steps, Features2, BlogLatestPosts, FAQs, Stats, CallToAction |
| `about.astro` | PageLayout | Hero, Stats, Features3×2, Steps2×2, Features2×2 |
| `pricing.astro` | PageLayout | HeroText, Pricing, Features3, Steps, FAQs, CallToAction |
| `services.astro` | PageLayout | Hero, Features2, Content×2, Testimonials, CallToAction |
| `contact.astro` | PageLayout | HeroText, Contact, Features2 |
| `homes/saas.astro` | PageLayout | Hero2, Features, Content×4, Pricing, FAQs, Steps2, BlogLatestPosts |
| `homes/startup.astro` | PageLayout | Hero (YouTube embed), Features2×2, Stats, Brands, Features, FAQs, Features3, CallToAction |
| `homes/mobile-app.astro` | PageLayout | Hero2, Features3, Content×2, Stats, Testimonials, FAQs, CallToAction |
| `homes/personal.astro` | PageLayout | Hero, Content×4, Steps×2, Features3, Testimonials, CallToAction, BlogLatestPosts |
| `landing/lead-generation.astro` | LandingLayout | Hero, CallToAction |
| `landing/sales.astro` | LandingLayout | Hero2, CallToAction |
| `landing/click-through.astro` | LandingLayout | Hero2, CallToAction |
| `landing/product.astro` | LandingLayout | Hero, CallToAction |
| `landing/pre-launch.astro` | LandingLayout | Hero2, CallToAction |
| `landing/subscription.astro` | LandingLayout | Hero2, CallToAction |

### Prose pages
| Page | Layout |
|---|---|
| `privacy.md` | MarkdownLayout |
| `terms.md` | MarkdownLayout |

### Dynamic routes (blog, unchanged)
- `[...blog]/index.astro` — blog listing
- `[...blog]/[...page].astro` — paginated blog
- `[...blog]/[category]/[...page].astro` — category filter
- `[...blog]/[tag]/[...page].astro` — tag filter

### Other
- `404.astro` — custom 404
- `rss.xml.ts` — RSS feed

## 4. Layouts and components

### Layout hierarchy
- `Layout.astro` — base HTML, head, body, view transitions
- `PageLayout.astro` — extends Layout, adds Announcement + Header + Footer from `navigation.ts`
- `LandingLayout.astro` — extends PageLayout, overrides header with minimal nav (landing links subset)
- `MarkdownLayout.astro` — extends PageLayout, renders title + prose content

### Widget components (19 types)
Hero, Hero2, HeroText, Note, Features, Features2, Features3, Content, Steps, Steps2, CallToAction, FAQs, Stats, Pricing, Testimonials, Brands, Contact, BlogLatestPosts, BlogHighlightedPosts

### Key patterns
- Widget components accept props via TypeScript interfaces in `src/types.d.ts`
- Many widgets support both prop-based and slot-based content (`title = await Astro.slots.render('title')`)
- Hero/Hero2 use `set:html` for title/subtitle (HTML strings from slots)
- All widgets share `Widget` base interface: `id?`, `isDark?`, `bg?`, `classes?`
- `Headline` interface shared: `title?`, `subtitle?`, `tagline?`

## 5. Build pipeline

- Build command: `astro build` (no pre-build scripts)
- Output mode: `static`
- `trailingSlash`: not set (defaults to `"ignore"`)
- `build.format`: not set (defaults to `"directory"` → URLs need trailing slashes for CC)
- No environment variables needed
- Integrations: tailwind, sitemap, mdx, icon, compress, astrowind vendor config

## 6. Flags and special patterns

- **Slot-to-prop migration**: Many widget invocations pass rich HTML via slots (`<Fragment slot="title">...</Fragment>`). These need conversion to string props in content files. The HTML will be rendered via `set:html`.
- **`astro-embed` YouTube**: Used directly in `homes/startup.astro` Hero image slot — not auto-imported
- **MDX explicit imports**: `astrowind-template-in-depth.mdx` and `markdown-elements-demo-post.mdx` use explicit `import` for Logo, YouTube, Tweet, Vimeo
- **Markdown tables**: Present in `markdown-elements-demo-post.mdx` — need `markdown.options.table: true` in CC config
- **Mobile App page**: Uses inline `<Button>` + `<Image>` components in Hero slots for app store buttons — these become actions in the block
- **Personal page**: Uses `getPermalink()` helper in actions — needs resolved URL in content file
- **`astro-compress`**: HTML minifier with `removeAttributeQuotes: false` — important for keeping `data-editable` attributes intact
- **Deployment files**: `netlify.toml`, `vercel.json`, `docker-compose.yml` present
- **Vendor integration**: `vendor/integration/` provides `astrowind:config` virtual module from `src/config.yaml`
