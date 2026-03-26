import Hero from '~/components/widgets/Hero.astro';
import Hero2 from '~/components/widgets/Hero2.astro';
import HeroText from '~/components/widgets/HeroText.astro';
import Note from '~/components/widgets/Note.astro';
import Features from '~/components/widgets/Features.astro';
import Features2 from '~/components/widgets/Features2.astro';
import Features3 from '~/components/widgets/Features3.astro';
import Content from '~/components/widgets/Content.astro';
import Steps from '~/components/widgets/Steps.astro';
import Steps2 from '~/components/widgets/Steps2.astro';
import CallToAction from '~/components/widgets/CallToAction.astro';
import FAQs from '~/components/widgets/FAQs.astro';
import Stats from '~/components/widgets/Stats.astro';
import Pricing from '~/components/widgets/Pricing.astro';
import Testimonials from '~/components/widgets/Testimonials.astro';
import Brands from '~/components/widgets/Brands.astro';
import Contact from '~/components/widgets/Contact.astro';
import BlogLatestPosts from '~/components/widgets/BlogLatestPosts.astro';
import BlogHighlightedPosts from '~/components/widgets/BlogHighlightedPosts.astro';

export const componentMap: Record<string, any> = {
  hero: Hero,
  hero2: Hero2,
  hero_text: HeroText,
  note: Note,
  features: Features,
  features2: Features2,
  features3: Features3,
  content: Content,
  steps: Steps,
  steps2: Steps2,
  call_to_action: CallToAction,
  faqs: FAQs,
  stats: Stats,
  pricing: Pricing,
  testimonials: Testimonials,
  brands: Brands,
  contact: Contact,
  blog_latest_posts: BlogLatestPosts,
  blog_highlighted_posts: BlogHighlightedPosts,
};
