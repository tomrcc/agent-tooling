# Visual Editing: Astroship

## Setup

- Installed `@cloudcannon/editable-regions` 0.0.12
- Added `editableRegions()` integration to `astro.config.mjs`
- Created `src/cloudcannon/registerComponents.ts` with 4 component registrations
- Imported from `Layout.astro` via `<script>` tag

## Registered components

| Key | Component | Data prop |
|---|---|---|
| hero | Hero | banner (object-bound, spread) |
| features | Features | features (object-bound, spread) |
| cta | Cta | cta (object-bound, spread) |
| pricing | PricingSection | plans (array-bound, spread + Object.values) |

All components accept spread props so that SSR and client-side re-rendering receive the same prop shape.

## Editable regions by page

### Homepage (`index.astro`)

- Hero: `<editable-component>` wrapping Hero component. Inside: text editables on title/description, image editable on banner image
- Features: `<editable-component>` wrapping Features component. Inside: text editables on heading/description, array editable on items with text editables per item
- CTA: `<editable-component>` wrapping Cta component. Inside: text editables on title/description, text editable on button label

Components were wrapped because:
- Hero has conditional icon rendering on buttons (style-dependent icon color)
- Features has an array with per-item rendering
- CTA button label needs live re-rendering

### About (`about.astro`)

- Section header (title/description) editable via `<span>` slots with `data-editable="text"`
- Text editables on heading and body_text
- Team members editable inline using `@file[src/content/team/<id>.md]` paths on name, title, and avatar

### Contact (`contact.astro`)

- Section header (title/description) editable via `<span>` slots with `data-editable="text"`
- Text editables on heading, body_text, address, email, phone
- Wrapped email/phone in `<span>` for editable text inside `<a>` tags

### Pricing (`pricing.astro`)

- Section header (title/description) editable via `<span>` slots with `data-editable="text"`
- PricingSection component wraps the full plans array with `data-prop="plans"`
- Inside: array editable on plans, array-item per plan, text editables on plan name/price/button text, array editable on features list
- PricingCard has conditional `popular` styling on the button, warranting component re-rendering

### Blog (`blog/[slug].astro`)

- Text editable on post title
- Block text editable on content body (`@content`)

## Fixes applied (post initial migration)

1. **Component prop shape mismatch**: All components were using named props (e.g. `<Hero banner={banner} />`), causing "Cannot read properties of undefined" errors during visual editor re-rendering. Fixed by spreading props (`<Hero {...banner} />`) and destructuring directly in components.
2. **Pricing architecture**: Per-card `<editable-component>` inside `<editable-array-item>` with empty `data-prop=""` was broken. Restructured to a single PricingSection component wrapping the full array.
3. **Section headers**: `<Fragment slot="...">` can't carry data attributes. Replaced with `<span>` elements carrying `data-editable="text"`.
4. **Cross-collection editables**: Team members on about page now use `@file` paths for inline editing.
5. **Team collection editor mode**: Set `_enabled_editors: [data]` since team .md files are data-only (no rendered body content).

## Build verification

- Client bundle includes registered components (~6MB, includes full editable-regions library)
