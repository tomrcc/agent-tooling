---
title: Building Accessible Forms
description: How to create forms that are usable by everyone, with proper labels, validation, and error handling.
author: Emma Brown
date: 2025-01-05
image: /posts/post-image-5.png
draft: false
tags:
  - Forms
  - Accessibility
  - UX
---

Forms are one of the most important interactive patterns on the web, and getting accessibility right is crucial. Every user needs to be able to fill out your forms successfully, regardless of how they interact with your site.

## Label Every Input

Every form input must have an associated label. The most reliable method is using the `<label>` element with a `for` attribute matching the input's `id`:

```html
<label for="email">Email address</label>
<input type="email" id="email" name="email" />
```

Placeholder text is not a substitute for labels — it disappears when the user starts typing and has poor contrast in most browsers.

## Error Handling

When form validation fails, communicate errors clearly:

1. Show a summary of all errors at the top of the form
2. Associate each error message with its field using `aria-describedby`
3. Move focus to the first error so screen reader users are immediately aware
4. Use both color and text/icons to indicate errors

## Required Fields

Mark required fields clearly with both visual indicators and the `required` attribute. The `aria-required="true"` attribute provides additional context for screen readers, though the native `required` attribute is usually sufficient.

## Fieldsets and Legends

Group related inputs (like radio buttons or a set of checkboxes) with `<fieldset>` and `<legend>`. This gives screen readers the context they need to understand the relationship between options.
