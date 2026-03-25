import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const commonFields = {
  title: z.string(),
  description: z.string(),
  meta_title: z.string().optional(),
  // z.coerce.date() handles both Date objects and ISO string dates from frontmatter (Zod 4)
  date: z.coerce.date().optional(),
  image: z.string().optional(),
  draft: z.boolean(),
};

// Post collection schema
const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/blog" }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    image: z.string().optional(),
    author: z.string().default("Admin"),
    // Use factory functions for mutable array defaults (Zod 4 best practice)
    categories: z.array(z.string()).default(() => ["others"]),
    tags: z.array(z.string()).default(() => ["others"]),
    draft: z.boolean().optional(),
  }),
});

// Author collection schema
const authorsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/authors" }),
  schema: z.object({
    ...commonFields,
    social: z
      .array(
        z
          .object({
            name: z.string().optional(),
            icon: z.string().optional(),
            link: z.string().optional(),
          })
          .optional(),
      )
      .optional(),
    draft: z.boolean().optional(),
  }),
});

// Page schemas — z.union tries most-specific first
const pageSchema = z.object({
  ...commonFields,
});

const contactPageSchema = z.object({
  ...commonFields,
  name_label: z.string(),
  email_label: z.string(),
  message_label: z.string(),
  submit_label: z.string(),
});

const homepageSchema = z.object({
  ...commonFields,
  banner: z.object({
    title: z.string(),
    content: z.string(),
    image: z.string(),
    button: z.object({
      enable: z.boolean(),
      label: z.string(),
      link: z.string(),
    }),
  }),
  features: z.array(
    z.object({
      title: z.string(),
      image: z.string(),
      content: z.string(),
      bulletpoints: z.array(z.string()),
      button: z.object({
        enable: z.boolean(),
        label: z.string(),
        link: z.string(),
      }),
    }),
  ),
});

const bannerBlock = z.object({
  _type: z.literal("banner"),
  title: z.string(),
  content: z.string(),
  image: z.string().optional(),
  button: z.object({
    enable: z.boolean(),
    label: z.string(),
    link: z.string(),
  }),
});

const featuresBlock = z.object({
  _type: z.literal("features"),
  items: z.array(
    z.object({
      title: z.string(),
      image: z.string(),
      content: z.string(),
      bulletpoints: z.array(z.string()),
      button: z.object({
        enable: z.boolean(),
        label: z.string(),
        link: z.string(),
      }),
    }),
  ),
});

const richTextBlock = z.object({
  _type: z.literal("rich_text"),
  content: z.string(),
});

const callToActionBlock = z.object({
  _type: z.literal("call_to_action"),
});

const testimonialBlock = z.object({
  _type: z.literal("testimonial"),
});

const contentBlock = z.discriminatedUnion("_type", [
  bannerBlock,
  featuresBlock,
  richTextBlock,
  callToActionBlock,
  testimonialBlock,
]);

const pageBuilderSchema = z.object({
  ...commonFields,
  hero_content: z.string().optional(),
  content_blocks: z.array(contentBlock),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/pages" }),
  schema: z.union([
    homepageSchema,
    contactPageSchema,
    pageBuilderSchema,
    pageSchema,
  ]),
});

// Export collections
export const collections = {
  pages: pagesCollection,
  blog: blogCollection,
  authors: authorsCollection,
};
