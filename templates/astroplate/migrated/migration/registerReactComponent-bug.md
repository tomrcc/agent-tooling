# Bug: `registerReactComponent` does not live-update in the visual editor

## Package

`@cloudcannon/editable-regions@^0.0.12`

## Summary

Components registered via `registerReactComponent()` render on initial page load but do not live-update when data changes in CloudCannon's visual editor sidebar. The same component registered as an Astro equivalent via `registerAstroComponent()` works correctly.

## Reproduction

1. Create a pure React display component (no hooks):

```tsx
export const AnnouncementDisplay: React.FC<Props> = ({ enable, text, link_text, link_url }) => {
  if (!enable || !text) return null;
  return <div><p>{text} <a href={link_url}>{link_text}</a></p></div>;
};
```

2. Register it:

```typescript
import { registerReactComponent } from "@cloudcannon/editable-regions/react";
registerReactComponent("announcement", AnnouncementDisplay);
```

3. Wrap the live component in an `<editable-component>`:

```astro
<editable-component data-component="announcement" data-prop="@data[announcement]">
  <Announcement client:load {...announcementData} />
</editable-component>
```

4. Open the page in CloudCannon's visual editor and edit a field in the sidebar.

**Expected:** The preview updates live.
**Actual:** The preview shows the initial content and never reflects edits.

## Likely cause

`registerReactComponent` wraps the component with `createRoot` + `flushSync` on a detached `document.createElement("div")`. The `update()` method in `EditableComponent` chains `_update()` with `.then()` but has no `.catch()` — if the React render throws (or the detached root behaves unexpectedly), `updatePromise` stays set permanently and all subsequent updates silently no-op.

Relevant code in `integrations/react.mjs`:

```javascript
const wrappedComponent = (props) => {
  const reactNode = createElement(component, props, null);
  const rootEl = document.createElement("div");
  const root = createRoot(rootEl);
  flushSync(() => root.render(reactNode));
  return rootEl;
};
```

And the stuck-promise issue in `nodes/editable-component.ts`:

```typescript
update(partialSubtree?) {
  if (this.updatePromise) {
    this.needsReupdate = true;           // queued but never executed
    return this.updatePromise;            // stuck promise
  }
  this.updatePromise = this._update(partialSubtree).then(() => {
    this.updatePromise = undefined;       // never reached if _update rejects
    // ...
  });
  // no .catch() — rejection locks the component permanently
}
```

## Workaround

Create a parallel Astro display component with identical markup and register it with `registerAstroComponent()` instead. The live site still uses the React component via `client:load`; only the visual editor renderer is swapped.

## Environment

- `@cloudcannon/editable-regions@^0.0.12`
- Astro 5.x, React 19.x
- Tested in CloudCannon's visual editor (iframe context)
