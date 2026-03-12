# Astroplate build notes

- Build command: `node scripts/themeGenerator.js && node scripts/jsonGenerator.js && npx astro build`
- Required extra dependency: `js-beautify` (not automatically installed with editable-regions)
- Used `--legacy-peer-deps` during `npm install` due to `@digi4care/astro-google-tagmanager` not supporting Astro 6
- All 28 pages built successfully
- Editable attributes confirmed in output HTML: 22 on homepage, 3 on about, 3 on blog posts, 1 on contact
- Hydration script bundled in `Base.astro_astro_type_script_index_0_lang.*.js`
- Styles self-injected at runtime (4 `createElement("style")` calls in the bundle)
