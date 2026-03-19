# Build and Test (Astro)

Guidance for validating an Astro migration works end-to-end.

## Build verification checklist

1. **Run the full build pipeline** -- use whatever `package.json` defines as the `build` script, not just `astro build`. Pre-build scripts (theme generation, search index, JSON data generation) must be included.

2. **Verify editable attributes in output HTML** -- spot-check key pages in `dist/` to confirm `data-editable` attributes survived the build. Count occurrences on the homepage (should be the highest) and a content page.

3. **Verify the registerComponents script is bundled** -- check that the built JS assets in `dist/` contain the editable-regions code from `src/cloudcannon/registerComponents.ts`. In Astro, this ends up in a hashed JS file (e.g. `Base.astro_astro_type_script_*`).

4. **Prompt user to test in Fog Machine** -- agents should not attempt this. Provide the user with what to verify:
   - Inline text editing works on the homepage banner
   - Image editing opens the image picker
   - Array item controls appear on feature sections
   - Cross-file editable regions (CTA, testimonial) bind to the correct file
   - Changes save correctly to the source files

## CloudCannon build command

The build command CloudCannon runs must match the full pipeline. For Astro sites with pre-build scripts:

```
node scripts/themeGenerator.js && node scripts/jsonGenerator.js && astro build
```

This goes in `.cloudcannon/initial-site-settings.json` as the `build_command`, or in `.cloudcannon/prebuild` if using the prebuild script approach (see [configuration.md](configuration.md)).

## Common issues

### Peer dependency conflicts

Older `@cloudcannon/editable-regions` versions may not list Astro 5+ as a supported peer. Use `--legacy-peer-deps` (npm) or equivalent to bypass.

### Style injection

The editable-regions library injects its own styles at runtime via `createElement("style")`. Each web component manages its own styles. You do **not** need to import a separate CSS file.

### `is:inline` style imports don't work

Astro's `<style is:inline>` bypasses Vite processing, so `@import` of node_modules paths won't resolve. Import CSS from `<script>` tags instead -- Vite processes these and handles CSS imports correctly.

### `astro:content` or `astro:assets` import errors in client bundle

If the build fails because Astro virtual modules can't be resolved in the client build, ensure the `editableRegions()` integration is registered in `astro.config.mjs`. The integration's Vite plugin shims these modules for client-side rendering.

---

**Example:** See `templates/astroplate/migrated/migration/build.md` for completed build notes.
