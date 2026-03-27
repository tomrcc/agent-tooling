import { z, defineCollection } from "astro:content";

const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    badge: z.string().optional(),
    tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
        message: 'tags must be unique',
    }).optional(),
    permalink: z.string().optional(),
    draft: z.boolean().default(false),
});

const storeSchema = z.object({
    title: z.string(),
    description: z.string(),
    custom_link_label: z.string(),
    custom_link: z.string().optional(),
    updatedDate: z.coerce.date(),
    pricing: z.string().optional(),
    oldPricing: z.string().optional(),
    badge: z.string().optional(),
    checkoutUrl: z.string().optional(),
    heroImage: z.string().optional(),
});

const cardItemSchema = z.object({
    title: z.string(),
    img: z.string().nullish(),
    desc: z.string().nullish(),
    url: z.string().nullish(),
    badge: z.string().nullish(),
    tags: z.array(z.string()).default([]),
    target: z.string().default("_blank"),
});

const cardSectionSchema = z.object({
    heading: z.string().nullish(),
    items: z.array(cardItemSchema).default([]),
});

const heroButtonSchema = z.object({
    text: z.string(),
    url: z.string(),
    variant: z.string().default("primary"),
    target: z.string().default("_blank"),
});

const heroSchema = z.object({
    greeting: z.string().nullish(),
    name: z.string().nullish(),
    tagline: z.string().nullish(),
    description: z.string().nullish(),
    buttons: z.array(heroButtonSchema).default([]),
});

const timelineEntrySchema = z.object({
    title: z.string(),
    subtitle: z.string().nullish(),
    description: z.string().nullish(),
});

const certificationEntrySchema = z.object({
    text: z.string(),
    url: z.string().nullish(),
});

const homepageSchema = z.object({
    _schema: z.literal("homepage"),
    title: z.string(),
    sidebar_id: z.string().optional(),
    hero: heroSchema,
    projects_heading: z.string().nullish(),
    items: z.array(cardItemSchema).default([]),
    blog_heading: z.string().nullish(),
    blog_posts_count: z.number().default(3),
});

const cardListingSchema = z.object({
    _schema: z.literal("card_listing"),
    title: z.string(),
    sidebar_id: z.string().optional(),
    sections: z.array(cardSectionSchema).default([]),
});

const cvSchema = z.object({
    _schema: z.literal("cv"),
    title: z.string(),
    sidebar_id: z.string().optional(),
    profile: z.string().nullish(),
    education: z.array(timelineEntrySchema).default([]),
    experience: z.array(timelineEntrySchema).default([]),
    certifications: z.array(certificationEntrySchema).default([]),
    skills: z.array(z.string()).default([]),
});

const pageSchema = z.object({
    _schema: z.literal("default"),
    title: z.string(),
    sidebar_id: z.string().optional(),
    description: z.string().nullish(),
    image: z.string().nullish(),
    draft: z.boolean().default(false),
});

export type BlogSchema = z.infer<typeof blogSchema>;
export type StoreSchema = z.infer<typeof storeSchema>;

const blogCollection = defineCollection({ schema: blogSchema });
const storeCollection = defineCollection({ schema: storeSchema });
const pagesCollection = defineCollection({
    schema: z.discriminatedUnion("_schema", [
        homepageSchema,
        cardListingSchema,
        cvSchema,
        pageSchema,
    ]),
});

export const collections = {
    'blog': blogCollection,
    'store': storeCollection,
    'pages': pagesCollection,
}
