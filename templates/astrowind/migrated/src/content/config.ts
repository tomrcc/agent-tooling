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
    variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).nullish(),
    text: z.string().nullish(),
    href: z.string().nullish(),
    target: z.string().nullish(),
    icon: z.string().nullish(),
    type: z.enum(['button', 'submit', 'reset']).nullish(),
  })
  .nullish();

const imageSchema = z
  .object({
    src: z.string().nullish(),
    alt: z.string().nullish(),
  })
  .nullish();

const itemSchema = z.object({
  title: z.string().nullish(),
  description: z.string().nullish(),
  icon: z.string().nullish(),
  callToAction: callToActionSchema,
  image: imageSchema,
});

const statSchema = z.object({
  amount: z.union([z.number(), z.string()]).nullish(),
  title: z.string().nullish(),
  icon: z.string().nullish(),
});

const priceSchema = z.object({
  title: z.string().nullish(),
  subtitle: z.string().nullish(),
  description: z.string().nullish(),
  price: z.union([z.number(), z.string()]).nullish(),
  period: z.string().nullish(),
  items: z.array(itemSchema).nullish(),
  callToAction: callToActionSchema,
  hasRibbon: z.boolean().nullish(),
  ribbonTitle: z.string().nullish(),
});

const testimonialSchema = z.object({
  title: z.string().nullish(),
  testimonial: z.string().nullish(),
  name: z.string().nullish(),
  job: z.string().nullish(),
  image: z
    .union([z.string(), z.object({ src: z.string().nullish(), alt: z.string().nullish() })])
    .nullish(),
});

const inputSchema = z.object({
  type: z.string(),
  name: z.string(),
  label: z.string().nullish(),
  autocomplete: z.string().nullish(),
  placeholder: z.string().nullish(),
});

const textareaSchema = z
  .object({
    label: z.string().nullish(),
    name: z.string().nullish(),
    placeholder: z.string().nullish(),
    rows: z.number().nullish(),
  })
  .nullish();

const disclaimerSchema = z
  .object({
    label: z.string().nullish(),
  })
  .nullish();

// Common block fields
const blockBase = {
  id: z.string().nullish(),
  isDark: z.boolean().nullish(),
  bg: z.string().nullish(),
  tagline: z.string().nullish(),
  title: z.string().nullish(),
  subtitle: z.string().nullish(),
};

// 19 block type schemas
const contentBlockSchema = z.discriminatedUnion('_type', [
  z.object({
    _type: z.literal('hero'),
    ...blockBase,
    content: z.string().nullish(),
    actions: z.array(z.object({
      variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).nullish(),
      text: z.string().nullish(),
      href: z.string().nullish(),
      target: z.string().nullish(),
      icon: z.string().nullish(),
    })).nullish(),
    image: z.union([z.string(), z.object({ src: z.string().nullish(), alt: z.string().nullish() })]).nullish(),
  }),
  z.object({
    _type: z.literal('hero2'),
    ...blockBase,
    content: z.string().nullish(),
    actions: z.array(z.object({
      variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).nullish(),
      text: z.string().nullish(),
      href: z.string().nullish(),
      target: z.string().nullish(),
      icon: z.string().nullish(),
    })).nullish(),
    image: z.union([z.string(), z.object({ src: z.string().nullish(), alt: z.string().nullish() })]).nullish(),
  }),
  z.object({
    _type: z.literal('hero_text'),
    ...blockBase,
    content: z.string().nullish(),
    callToAction: callToActionSchema,
    callToAction2: callToActionSchema,
  }),
  z.object({
    _type: z.literal('note'),
    ...blockBase,
    icon: z.string().nullish(),
    description: z.string().nullish(),
  }),
  z.object({
    _type: z.literal('features'),
    ...blockBase,
    items: z.array(itemSchema).nullish(),
    columns: z.number().nullish(),
    defaultIcon: z.string().nullish(),
  }),
  z.object({
    _type: z.literal('features2'),
    ...blockBase,
    items: z.array(itemSchema).nullish(),
    columns: z.number().nullish(),
  }),
  z.object({
    _type: z.literal('features3'),
    ...blockBase,
    items: z.array(itemSchema).nullish(),
    columns: z.number().nullish(),
    defaultIcon: z.string().nullish(),
    image: z.union([z.string(), z.object({ src: z.string().nullish(), alt: z.string().nullish() })]).nullish(),
    isBeforeContent: z.boolean().nullish(),
    isAfterContent: z.boolean().nullish(),
  }),
  z.object({
    _type: z.literal('content'),
    ...blockBase,
    content: z.string().nullish(),
    items: z.array(itemSchema).nullish(),
    columns: z.number().nullish(),
    image: z.union([z.string(), z.object({ src: z.string().nullish(), alt: z.string().nullish() })]).nullish(),
    isReversed: z.boolean().nullish(),
    isAfterContent: z.boolean().nullish(),
    callToAction: callToActionSchema,
  }),
  z.object({
    _type: z.literal('steps'),
    ...blockBase,
    items: z.array(itemSchema).nullish(),
    image: z.union([z.string(), z.object({ src: z.string().nullish(), alt: z.string().nullish() })]).nullish(),
    isReversed: z.boolean().nullish(),
  }),
  z.object({
    _type: z.literal('steps2'),
    ...blockBase,
    items: z.array(itemSchema).nullish(),
    callToAction: callToActionSchema,
    isReversed: z.boolean().nullish(),
  }),
  z.object({
    _type: z.literal('call_to_action'),
    ...blockBase,
    actions: z.array(z.object({
      variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).nullish(),
      text: z.string().nullish(),
      href: z.string().nullish(),
      target: z.string().nullish(),
      icon: z.string().nullish(),
    })).nullish(),
  }),
  z.object({
    _type: z.literal('faqs'),
    ...blockBase,
    items: z.array(itemSchema).nullish(),
    columns: z.number().nullish(),
  }),
  z.object({
    _type: z.literal('stats'),
    ...blockBase,
    stats: z.array(statSchema).nullish(),
  }),
  z.object({
    _type: z.literal('pricing'),
    ...blockBase,
    prices: z.array(priceSchema).nullish(),
  }),
  z.object({
    _type: z.literal('testimonials'),
    ...blockBase,
    testimonials: z.array(testimonialSchema).nullish(),
    callToAction: callToActionSchema,
  }),
  z.object({
    _type: z.literal('brands'),
    ...blockBase,
    icons: z.array(z.string()).nullish(),
    images: z.array(z.object({ src: z.string().nullish(), alt: z.string().nullish() })).nullish(),
  }),
  z.object({
    _type: z.literal('contact'),
    ...blockBase,
    inputs: z.array(inputSchema).nullish(),
    textarea: textareaSchema,
    disclaimer: disclaimerSchema,
    button: z.string().nullish(),
    description: z.string().nullish(),
  }),
  z.object({
    _type: z.literal('blog_latest_posts'),
    ...blockBase,
    linkText: z.string().nullish(),
    linkUrl: z.string().nullish(),
    information: z.string().nullish(),
    count: z.number().nullish(),
  }),
  z.object({
    _type: z.literal('blog_highlighted_posts'),
    ...blockBase,
    linkText: z.string().nullish(),
    linkUrl: z.string().nullish(),
    information: z.string().nullish(),
    postIds: z.array(z.string()).nullish(),
  }),
]);

// Page schemas
const commonPageFields = {
  title: z.string(),
  description: z.string().nullish(),
  metadata: metadataDefinition(),
  _schema: z.string().nullish(),
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
