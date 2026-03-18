# Astroplate Build Notes

## Build Command

```
node scripts/themeGenerator.js && node scripts/jsonGenerator.js && astro build
```

Pre-build scripts run first (theme CSS generation, search JSON index), then the Astro static build.

In CloudCannon, the prebuild scripts run via `.cloudcannon/prebuild` and the build command is `astro build`.

## Build Result

Build succeeded: 28 pages built in 7.69s, zero errors.

Output directory: `dist/`

## Verification

### Editable attributes in built HTML

- **Homepage** (`dist/index.html`): contains `data-editable="text"`, `data-editable="image"`, `data-editable="array"`, and `data-editable="array-item"` attributes. Banner, features, CTA, and testimonial sections all present.
- **Blog post** (`dist/blog/post-1/index.html`): contains `data-editable="text"` (title), `data-editable="image"` (hero), and `data-editable="text" data-type="block"` (content body).

### Hydration script bundled

The editable-regions hydration code is bundled into `dist/_astro/Base.astro_astro_type_script_index_0_lang.DAKEaMul.js` and loaded on every page via a `<script type="module">` tag in the `<body>`.

### No build issues

- No missing dependency errors
- No peer dependency conflicts (installed with `--legacy-peer-deps`)
- No style import issues (editable-regions self-injects styles at runtime)

## Fog Machine Testing

The following should be verified in Fog Machine (not done by the agent):

- Inline text editing works on the homepage banner title, content, and button label
- Image editing opens the image picker on the banner image and feature images
- Array item controls (reorder, add, delete) appear on homepage feature sections
- Cross-file editable regions on the CTA and testimonial sections bind to `src/content/sections/call-to-action.md` and `src/content/sections/testimonial.md`
- Blog post title, image, and content body are editable in the visual editor
- Page header title is editable on about, contact, and other pages
- Changes save correctly to the source markdown files
