# Build: Astroship

## Build result

`pnpm build` passes cleanly. 10 pages built in ~2.6s.

## Output verification

- All 10 pages generate successfully
- `data-editable` attributes survive in all output HTML files
- Client JS bundle generated at `dist/_astro/Layout.astro_astro_type_script_index_0_lang.*.js` (~6MB, includes editable-regions library + registered Astro components)
- Vite warns about chunk size (>500KB) — expected with the editable-regions library

## CloudCannon build settings

In `.cloudcannon/initial-site-settings.json`:
- `install_command: pnpm i`
- `build_command: pnpm build`
- `output_path: dist`
- No prebuild script needed (no pre-build steps)

## Manual testing needed

Test in Fog Machine:
- Inline text editing on homepage banner title/description
- Image editing on hero image (opens picker)
- Array CRUD controls on features section
- CTA text editing + button label editing
- Component re-rendering on data changes (sidebar edits should live-update)
- Blog post title and content body editing
- Contact page field editing
- Pricing plan array management
- Snippet toolbar shows Button option in MDX content editor
