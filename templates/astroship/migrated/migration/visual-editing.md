# Visual Editing: Astroship

## Setup

- Installed `@cloudcannon/editable-regions` 0.0.12
- Added `editableRegions()` integration to `astro.config.mjs`
- Created `src/cloudcannon/registerComponents.ts` with 4 component registrations
- Imported from `Layout.astro` via `<script>` tag

## Registered components

| Key | Component | Data prop |
|---|---|---|
| hero | Hero | banner |
| features | Features | features |
| cta | Cta | cta |
| pricing-card | PricingCard | (per array item) |

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

- Text editables on heading and body_text
- Team members not made editable inline (collection items, edited via their own files)

### Contact (`contact.astro`)

- Text editables on heading, body_text, address, email, phone
- Wrapped email/phone in `<span>` for editable text inside `<a>` tags

### Pricing (`pricing.astro`)

- Array editable on plans grid
- Each plan wrapped as array-item with component editable for PricingCard
- PricingCard has conditional `popular` styling on the button, warranting component re-rendering

### Blog (`blog/[slug].astro`)

- Text editable on post title
- Block text editable on content body (`@content`)

## Build verification

- 27 `data-editable` attributes on homepage
- 2 on about
- 5 on contact
- 4 on pricing
- 2 on blog posts
- Client bundle includes registered components (~6MB, includes full editable-regions library)
