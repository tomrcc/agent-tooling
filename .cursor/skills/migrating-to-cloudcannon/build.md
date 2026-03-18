# Build and Test

Guidance for validating a migration works end-to-end.

## Build verification checklist

1. **Run the full build command** -- use whatever `package.json` defines as the `build` script, not just the SSG build. Pre-build scripts (theme generation, search index, etc.) must be included.

2. **Check for missing dependencies** -- the `@cloudcannon/editable-regions` package may have peer/optional dependencies that aren't automatically installed. If the build fails with unresolved imports, install the missing package.

3. **Verify editable attributes in output HTML** -- spot-check key pages to confirm `data-editable` attributes survived the build. Count occurrences on the homepage (should be the highest) and a content page.

4. **Verify the registerComponents script is bundled** -- check that the built JS assets contain the editable-regions code from `src/cloudcannon/registerComponents.ts`. In Astro, this ends up in a `Base.astro_astro_type_script_*` file.

5. **Prompt user to test in Fog Machine** -- agents should not attempt this. Provide the user with what to verify:
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

This goes in `cloudcannon.config.yml` under the `build` section (Phase 2).

## Common issues

### Missing `js-beautify` dependency

The `@cloudcannon/editable-regions` package uses `js-beautify` in its `EditableSource` node. If the build fails with:

```
Rollup failed to resolve import "js-beautify" from "...editable-regions/nodes/editable-source.ts"
```

Install it: `npm install js-beautify --legacy-peer-deps` (or equivalent).

### Peer dependency conflicts

Older Astro integration packages may not list Astro 6 as a supported peer. Use `--legacy-peer-deps` (npm) or equivalent to bypass.

### Style injection

The editable-regions library injects its own styles at runtime via `createElement("style")`. Each web component manages its own styles. You do **not** need to import a separate CSS file.

### `is:inline` style imports don't work

Astro's `<style is:inline>` bypasses Vite processing, so `@import` of node_modules paths won't resolve. Import CSS from `<script>` tags instead (Vite processes these and handles CSS imports correctly).

---

**Example:** See `templates/astroplate/migration/build.md` for completed build notes.
