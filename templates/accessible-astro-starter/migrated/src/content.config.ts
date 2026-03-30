import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const heroButtonSchema = z.object({
  label: z.string(),
  href: z.string(),
  type: z.string().default('primary'),
  icon: z.string().nullish(),
})

const featureSchema = z.object({
  icon: z.string().default('lucide:rocket'),
  title: z.string(),
  description: z.string(),
})

const contentSectionSchema = z.object({
  image: z.string(),
  heading: z.string(),
  content: z.string(),
  reverse_image: z.boolean().default(false),
})

const faqItemSchema = z.object({
  title: z.string(),
  content: z.string(),
})

const communityMemberSchema = z.string()

const counterSchema = z.object({
  count: z.string(),
  title: z.string(),
  subtitle: z.string(),
})

const commonPageFields = {
  _schema: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
}

const homepageSchema = z.object({
  ...commonPageFields,
  hero: z.object({
    title: z.string().nullish(),
    gradient_text: z.string().nullish(),
    image: z.string().nullish(),
    buttons: z.array(heroButtonSchema).default([]),
  }),
  features: z.array(featureSchema).default([]),
  content_sections: z.array(contentSectionSchema).default([]),
  show_featured_projects: z.boolean().default(true),
  show_featured_posts: z.boolean().default(true),
  faq: z.object({
    title: z.string().nullish(),
    description: z.string().nullish(),
    link_text: z.string().nullish(),
    link_href: z.string().nullish(),
    items: z.array(faqItemSchema).default([]),
  }),
  community: z.object({
    title: z.string().nullish(),
    description: z.string().nullish(),
    members: z.array(communityMemberSchema).default([]),
  }),
  counters_heading: z.string().nullish(),
  counters: z.array(counterSchema).default([]),
})

const pageSchema = z.object({
  ...commonPageFields,
})

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.union([homepageSchema, pageSchema]),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullish(),
    author: z.string().nullish(),
    date: z.coerce.date().nullish(),
    image: z.string().nullish(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  }),
})

export const collections = { pages, blog, projects }
