import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
  schema: z.object({
    draft: z.boolean(),
    title: z.string(),
    snippet: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z
      .string()
      .transform((str) => new Date(str)),
    author: z.string().default("Astroship"),
    category: z.string(),
    tags: z.array(z.string()),
  }),
});

const teamCollection = defineCollection({
  schema: z.object({
    draft: z.boolean(),
    name: z.string(),
    title: z.string(),
    avatar: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z
      .string()
      .transform((str) => new Date(str)),
  }),
});

const buttonSchema = z.object({
  label: z.string(),
  link: z.string(),
  style: z.string().optional(),
  icon: z.string().optional(),
});

const featureItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});

const homepageSchema = z.object({
  _schema: z.literal("homepage").optional(),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  banner: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    image_alt: z.string().optional().default(""),
    buttons: z.array(buttonSchema),
  }),
  features: z.object({
    heading: z.string(),
    description: z.string(),
    items: z.array(featureItemSchema),
  }),
  cta: z.object({
    title: z.string(),
    description: z.string(),
    button: z.object({
      label: z.string(),
      link: z.string(),
    }),
  }),
});

const pricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  popular: z.boolean().default(false),
  features: z.array(z.string()),
  button: z.object({
    text: z.string(),
    link: z.string(),
  }),
});

const pricingSchema = z.object({
  _schema: z.literal("pricing").optional(),
  title: z.string(),
  description: z.string(),
  plans: z.array(pricingPlanSchema),
});

const contactSchema = z.object({
  _schema: z.literal("contact").optional(),
  title: z.string(),
  description: z.string(),
  heading: z.string(),
  body_text: z.string(),
  address: z.string(),
  email: z.string(),
  phone: z.string(),
});

const aboutSchema = z.object({
  _schema: z.literal("about").optional(),
  title: z.string(),
  description: z.string(),
  heading: z.string(),
  body_text: z.string(),
});

const pagesCollection = defineCollection({
  schema: z.union([homepageSchema, pricingSchema, contactSchema, aboutSchema]),
});

export const collections = {
  blog: blogCollection,
  team: teamCollection,
  pages: pagesCollection,
};
