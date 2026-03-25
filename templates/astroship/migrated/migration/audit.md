# Audit: Astroship

## 1. Astro version and dependencies

- **Astro**: ^5.5.2
- **MDX**: @astrojs/mdx ^4.2.0
- **Sitemap**: @astrojs/sitemap ^3.2.1
- **CSS**: Tailwind CSS v4 via @tailwindcss/vite ^4.0.14 + @tailwindcss/typography ^0.5.16
- **Icons**: astro-icon ^1.1.5 with @iconify-json/bx, @iconify-json/simple-icons, @iconify-json/uil
- **SEO**: astro-seo ^0.8.4
- **Nav**: astro-navbar ^2.3.9
- **Fonts**: @fontsource-variable/inter, @fontsource-variable/bricolage-grotesque
- **Image**: sharp ^0.33.5
- **Package manager**: pnpm (lockfile present)
- **Node version**: not specified

## 2. Content collections

Uses legacy `src/content/config.ts` (not the Astro 5 `content.config.ts`).

### blog

- Path: `src/content/blog/`
- 4 files: 3 `.md`, 1 `.mdx` (kitchensink.mdx)
- Schema: `draft` (boolean), `title` (string), `snippet` (string), `image` ({src, alt}), `publishDate` (string → Date via transform), `author` (string, default "Astroship"), `category` (string), `tags` (array of strings)
- Consumed by: `blog.astro` (listing via `getCollection`), `blog/[slug].astro` (detail via `getStaticPaths`)

### team

- Path: `src/content/team/`
- 3 files
- Schema: `draft` (boolean), `name` (string), `title` (string), `avatar` ({src, alt}), `publishDate` (string → Date via transform)
- Consumed by: `about.astro` (via `getCollection`)

### Data files

None found outside collections.

## 3. Pages and routing

| Route | Type | Data source |
|---|---|---|
| `/` | Static | Hardcoded in hero.astro, features.astro, cta.astro, logos.astro |
| `/about` | Static | Hardcoded heading/description + `team` collection |
| `/pricing` | Static | Hardcoded pricing array in pricing.astro page |
| `/contact` | Static | Hardcoded address/email/phone in contact.astro |
| `/blog` | Static | `blog` collection listing |
| `/blog/[slug]` | Dynamic | `blog` collection via `getStaticPaths` |
| `/404` | Static | Hardcoded |

## 4. Layouts and components

### Layout hierarchy

- `Layout.astro` — base layout wrapping Navbar + slot + Footer. Accepts `title` prop for SEO.
- `BlogLayout.astro` — exists but **unused** (blog posts render via `[slug].astro`)

### Key components

| Component | Data | Visual editing candidate |
|---|---|---|
| `hero.astro` | Hardcoded title, description, 2 buttons, hero image import | Yes (component) |
| `features.astro` | Hardcoded array of 6 items (title, description, icon) | Yes (component with array) |
| `cta.astro` | Hardcoded heading, description, button | Yes (component) |
| `pricing.astro` | Accepts `plan` prop, renders pricing card | Yes (component) |
| `logos.astro` | Hardcoded Iconify icon refs | No (icon names aren't useful editor content) |
| `sectionhead.astro` | Slots: title, desc | Via page-level editables |
| `contactform.astro` | Static HTML form | No |
| `container.astro` | Layout wrapper | No |
| `navbar/navbar.astro` | Navigation | No (sidebar) |
| `footer.astro` | Footer | No (sidebar) |

### Interactive islands

None — no `client:*` directives.

### MDX components

`kitchensink.mdx` uses `import Button from "@/components/ui/button.astro"` with `<Button>Click Me</Button>` usage. No auto-import configured.

## 5. Build pipeline

- Build script: `astro build` (no pre-build steps)
- Output: `dist/`
- `astro.config.mjs`: `output` not set (defaults to "static"), no `trailingSlash` (defaults to "ignore"), no `build.format` (defaults to "directory")
- Site: `https://astroship.web3templates.com`
- Integrations: mdx(), sitemap(), icon()
- Tailwind via Vite plugin, not Astro integration

## 6. Flags and special patterns

- **Hero image** imported from `@/assets/hero.png` via Astro's asset pipeline. Needs to move to `public/images/` for CMS compatibility (string path in frontmatter).
- **Pricing `price` field** has mixed types: string (`"Free"`, `"Custom"`) or object (`{monthly, annual, discount, original}`). Simplify to string for CMS — the template only uses `plan.price.monthly` for objects.
- **MDX import statement** in kitchensink.mdx — need auto-import or `components` prop + snippet config for Button.
- **Markdown tables** in kitchensink.mdx — need `markdown.options.table: true` and `_editables.content.table: true`.
- **`z.string().transform()`** on publishDate — CloudCannon expects ISO date strings, which will work.
- **Blog `image` field** is an object `{src, alt}` — configure `_inputs` accordingly.
- **`BlogLayout.astro`** is unused — leave as-is.
- **`set:html`** not used in content templates.
