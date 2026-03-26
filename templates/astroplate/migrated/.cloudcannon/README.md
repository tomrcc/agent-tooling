# Welcome to Astroplate

This site includes a blog, author profiles, and flexible pages that can be built from reusable content blocks. You can manage all of your content directly from this CMS.

## Quick links

- [Pages](cloudcannon:collections/pages)
- [Blog posts](cloudcannon:collections/blog)
- [Authors](cloudcannon:collections/authors)
- [Data](cloudcannon:collections/data)
- [Site Settings](cloudcannon:collections/config)

## Pages

Your site pages live in the **Pages** section of the sidebar.

**Creating a page:** Click the **+ Add** button and choose a type:
- **Page** -- a standard page with a title, description, and body content
- **Page Builder** -- a flexible page assembled from reusable blocks (banners, features, rich text, calls to action, testimonials)

**Editing a page:** Click any page to open it. Use the **Visual** editor to see a live preview as you make changes, or switch to the **Data** view to edit page details as a form.

**Deleting a page:** Open the page, then use the menu (three dots) in the top right to delete it.

**Page builder pages:** When editing a page builder page, scroll down to the "Content Blocks" section to add, remove, or reorder blocks. Each block type has its own fields -- click a block to expand and edit it.

### Preview URL for new pages

When you create a new page, the visual editor needs an existing page to show as a preview until the new page is built. By default, new standard pages preview using the Elements page, and new page builder pages preview using the Services page.

If the visual preview looks wrong or shows unexpected content after creating a new page, it's likely because the page being used for the preview was deleted or renamed. Ask a developer to update the preview page setting in the site configuration, or simply save your new page and trigger a build -- once built, the page will use its own URL for the preview.

## Blog posts

Your blog posts live in the **Blogging > Blog** section of the sidebar.

**Creating a post:** Click **+ Add** and choose "Blog Post". Fill in a title, author, date, and start writing.

**Editing a post:** Click any post to open it. You can use:
- **Visual** -- live preview of your post
- **Content** -- focused writing view with formatting toolbar
- **Data** -- edit post details as a form

**Deleting a post:** Open the post, then use the menu (three dots) in the top right.

**Post fields to know about:**
- **Author** -- pick from existing authors in the dropdown
- **Categories** and **Tags** -- organize your posts; you can pick existing values or create new ones
- **Draft** -- toggle on to hide the post from the live site
- **Image** -- the post's featured image, used in listings and social sharing

## Authors

Author profiles live in **Blogging > Authors**.

**Creating an author:** Click **+ Add** and choose "Author". Fill in a name, bio, avatar image, and social links.

**Editing an author:** Click the author to open their profile. Authors are linked to blog posts by name -- when you select an author in a blog post, it pulls from this list.

**Deleting an author:** Open the author profile and use the menu (three dots) in the top right. Note that blog posts referencing a deleted author will show a missing author.

## Data files

Shared content that appears across the site lives in the **Data** section of the sidebar. These files control content that shows up on multiple pages:

- **Announcement** -- the banner that appears at the top of the site. Toggle "Enable" to show or hide it, and set how many days before it auto-dismisses.
- **Call to Action** -- the call-to-action section that appears on various pages. Edit the heading, description, image, and button.
- **Testimonial** -- the testimonials section. Add, edit, or remove individual testimonials (name, role, avatar, and quote).

## Site Settings

Configuration files live in the **Site Settings** section of the sidebar:

- **Menu** -- control the main navigation and footer links. Add, remove, or reorder menu items, and create dropdown menus.
- **Social** -- manage your social media links.
- **Config** -- general site settings like the site title, logo, description, search toggle, dark mode, and pagination.
- **Theme** -- colors and fonts. Adjust the color palette for light and dark modes, and change the font families and sizes.

## Rich text components

When writing blog posts or page content, you can insert special components using the **+** button in the formatting toolbar:

- **Button** -- a styled link button
- **Video** -- embed a video
- **Notice** -- a highlighted callout box (note, tip, info, or warning)
- **YouTube** -- embed a YouTube video by its ID
- **Accordion** -- a collapsible section with a title
- **Tabs** -- tabbed content with multiple panels
