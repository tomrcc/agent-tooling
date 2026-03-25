# Content: Astroship

## Changes made

### Created `src/content/pages/` collection

Four content files replace hardcoded data in components:

- **`index.md`** (`_schema: homepage`): banner (title, description, image, buttons), features (heading, description, items array), cta (title, description, button)
- **`about.md`** (`_schema: about`): title, description, heading, body_text
- **`pricing.md`** (`_schema: pricing`): title, description, plans array
- **`contact.md`** (`_schema: contact`): title, description, heading, body_text, address, email, phone

### Updated `src/content/config.ts`

Added `pagesCollection` with `z.union([homepageSchema, pricingSchema, contactSchema, aboutSchema])`. Each schema type has distinct required fields (homepage requires `banner`/`features`/`cta`, pricing requires `plans`, etc.) so the union discriminates without a discriminator field. `_schema` is optional in the Zod schemas since it's only used by CloudCannon.

### Refactored components to accept props

- `hero.astro`: accepts `{ banner }` prop instead of importing hero image and hardcoding text
- `features.astro`: accepts `{ features }` prop instead of hardcoded array
- `cta.astro`: accepts `{ cta }` prop instead of hardcoded text
- `pricing.astro`: no changes (already accepted `{ plan }` prop)

### Updated page templates

All four pages now use `getEntry("pages", "<slug>")` and pass data to components as props.

### Hero image moved to `public/images/`

Copied `src/assets/hero.png` to `public/images/hero.png` so it can be referenced as a string path (`/images/hero.png`) in frontmatter. The `Picture` component was replaced with a plain `<img>` since string paths work directly.

### Pricing price field simplified

Original had mixed types (string or object with `monthly`/`annual`/`discount`/`original`). Simplified to string-only in frontmatter since the pricing card template only displayed the monthly value for object prices.

### MDX import handled via `components` prop

`kitchensink.mdx` had an explicit `import Button from "@/components/ui/button.astro"`. Removed the import and passed Button via the `components` prop in `blog/[slug].astro`: `<Content components={{ Button }} />`. Auto-import via `astro-auto-import` was tested but didn't resolve correctly, so the simpler `components` prop approach was used.

## Not changed

- `logos.astro`: left hardcoded (Iconify icon refs, not useful editor content)
- `BlogLayout.astro`: unused, left as-is
- Blog and team collections: already well-structured, no content changes needed
