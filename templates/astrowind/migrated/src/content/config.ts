import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

// Shared sub-schemas

const callToActionSchema = z
  .object({
    variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).optional(),
    text: z.string().optional(),
    href: z.string().optional(),
    target: z.string().optional(),
    icon: z.string().optional(),
    type: z.enum(['button', 'submit', 'reset']).optional(),
  })
  .optional();

const imageSchema = z
  .object({
    src: z.string(),
    alt: z.string().optional(),
  })
  .optional();

const itemSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  callToAction: callToActionSchema,
  image: imageSchema,
});

const statSchema = z.object({
  amount: z.union([z.number(), z.string()]).optional(),
  title: z.string().optional(),
  icon: z.string().optional(),
});

const priceSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  price: z.union([z.number(), z.string()]).optional(),
  period: z.string().optional(),
  items: z.array(itemSchema).optional(),
  callToAction: callToActionSchema,
  hasRibbon: z.boolean().optional(),
  ribbonTitle: z.string().optional(),
});

const testimonialSchema = z.object({
  title: z.string().optional(),
  testimonial: z.string().optional(),
  name: z.string().optional(),
  job: z.string().optional(),
  image: z
    .union([z.string(), z.object({ src: z.string(), alt: z.string().optional() })])
    .optional(),
});

const inputSchema = z.object({
  type: z.string(),
  name: z.string(),
  label: z.string().optional(),
  autocomplete: z.string().optional(),
  placeholder: z.string().optional(),
});

const textareaSchema = z
  .object({
    label: z.string().optional(),
    name: z.string().optional(),
    placeholder: z.string().optional(),
    rows: z.number().optional(),
  })
  .optional();

const disclaimerSchema = z
  .object({
    label: z.string().optional(),
  })
  .optional();

// Common block fields
const blockBase = {
  id: z.string().optional(),
  isDark: z.boolean().optional(),
  bg: z.string().optional(),
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
};

// 19 block type schemas
const contentBlockSchema = z.discriminatedUnion('_type', [
  z.object({
    _type: z.literal('hero'),
    ...blockBase,
    content: z.string().optional(),
    actions: z.array(z.object({
      variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).optional(),
      text: z.string().optional(),
      href: z.string().optional(),
      target: z.string().optional(),
      icon: z.string().optional(),
    })).optional(),
    image: z.union([z.string(), z.object({ src: z.string(), alt: z.string().optional() })]).optional(),
  }),
  z.object({
    _type: z.literal('hero2'),
    ...blockBase,
    content: z.string().optional(),
    actions: z.array(z.object({
      variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).optional(),
      text: z.string().optional(),
      href: z.string().optional(),
      target: z.string().optional(),
      icon: z.string().optional(),
    })).optional(),
    image: z.union([z.string(), z.object({ src: z.string(), alt: z.string().optional() })]).optional(),
  }),
  z.object({
    _type: z.literal('hero_text'),
    ...blockBase,
    content: z.string().optional(),
    callToAction: callToActionSchema,
    callToAction2: callToActionSchema,
  }),
  z.object({
    _type: z.literal('note'),
    ...blockBase,
    icon: z.string().optional(),
    description: z.string().optional(),
  }),
  z.object({
    _type: z.literal('features'),
    ...blockBase,
    items: z.array(itemSchema).optional(),
    columns: z.number().optional(),
    defaultIcon: z.string().optional(),
  }),
  z.object({
    _type: z.literal('features2'),
    ...blockBase,
    items: z.array(itemSchema).optional(),
    columns: z.number().optional(),
  }),
  z.object({
    _type: z.literal('features3'),
    ...blockBase,
    items: z.array(itemSchema).optional(),
    columns: z.number().optional(),
    defaultIcon: z.string().optional(),
    image: z.union([z.string(), z.object({ src: z.string(), alt: z.string().optional() })]).optional(),
    isBeforeContent: z.boolean().optional(),
    isAfterContent: z.boolean().optional(),
  }),
  z.object({
    _type: z.literal('content'),
    ...blockBase,
    content: z.string().optional(),
    items: z.array(itemSchema).optional(),
    columns: z.number().optional(),
    image: z.union([z.string(), z.object({ src: z.string(), alt: z.string().optional() })]).optional(),
    isReversed: z.boolean().optional(),
    isAfterContent: z.boolean().optional(),
    callToAction: callToActionSchema,
  }),
  z.object({
    _type: z.literal('steps'),
    ...blockBase,
    items: z.array(itemSchema).optional(),
    image: z.union([z.string(), z.object({ src: z.string(), alt: z.string().optional() })]).optional(),
    isReversed: z.boolean().optional(),
  }),
  z.object({
    _type: z.literal('steps2'),
    ...blockBase,
    items: z.array(itemSchema).optional(),
    callToAction: callToActionSchema,
    isReversed: z.boolean().optional(),
  }),
  z.object({
    _type: z.literal('call_to_action'),
    ...blockBase,
    actions: z.array(z.object({
      variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).optional(),
      text: z.string().optional(),
      href: z.string().optional(),
      target: z.string().optional(),
      icon: z.string().optional(),
    })).optional(),
  }),
  z.object({
    _type: z.literal('faqs'),
    ...blockBase,
    items: z.array(itemSchema).optional(),
    columns: z.number().optional(),
  }),
  z.object({
    _type: z.literal('stats'),
    ...blockBase,
    stats: z.array(statSchema).optional(),
  }),
  z.object({
    _type: z.literal('pricing'),
    ...blockBase,
    prices: z.array(priceSchema).optional(),
  }),
  z.object({
    _type: z.literal('testimonials'),
    ...blockBase,
    testimonials: z.array(testimonialSchema).optional(),
    callToAction: callToActionSchema,
  }),
  z.object({
    _type: z.literal('brands'),
    ...blockBase,
    icons: z.array(z.string()).optional(),
    images: z.array(z.object({ src: z.string(), alt: z.string().optional() })).optional(),
  }),
  z.object({
    _type: z.literal('contact'),
    ...blockBase,
    inputs: z.array(inputSchema).optional(),
    textarea: textareaSchema,
    disclaimer: disclaimerSchema,
    button: z.string().optional(),
    description: z.string().optional(),
  }),
  z.object({
    _type: z.literal('blog_latest_posts'),
    ...blockBase,
    linkText: z.string().optional(),
    linkUrl: z.string().optional(),
    information: z.string().optional(),
    count: z.number().optional(),
  }),
  z.object({
    _type: z.literal('blog_highlighted_posts'),
    ...blockBase,
    linkText: z.string().optional(),
    linkUrl: z.string().optional(),
    information: z.string().optional(),
    postIds: z.array(z.string()).optional(),
  }),
]);

// Page schemas
const commonPageFields = {
  title: z.string(),
  description: z.string().optional(),
  metadata: metadataDefinition(),
  _schema: z.string().optional(),
};

const pageBuilderSchema = z.object({
  ...commonPageFields,
  layout: z.enum(['page', 'landing']).default('page'),
  content_blocks: z.array(contentBlockSchema),
});

const defaultPageSchema = z.object({
  ...commonPageFields,
  layout: z.enum(['page', 'landing']).default('page'),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/pages' }),
  schema: z.union([pageBuilderSchema, defaultPageSchema]),
});

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

export const collections = {
  pages: pagesCollection,
  post: postCollection,
};
