import { registerAstroComponent } from '@cloudcannon/editable-regions/astro';

import Hero from '~/components/widgets/Hero.astro';
import Hero2 from '~/components/widgets/Hero2.astro';
import Features from '~/components/widgets/Features.astro';
import Content from '~/components/widgets/Content.astro';
import CallToAction from '~/components/widgets/CallToAction.astro';
import Steps from '~/components/widgets/Steps.astro';
import FAQs from '~/components/widgets/FAQs.astro';
import Testimonials from '~/components/widgets/Testimonials.astro';

registerAstroComponent('hero', Hero);
registerAstroComponent('hero2', Hero2);
registerAstroComponent('features', Features);
registerAstroComponent('content', Content);
registerAstroComponent('call-to-action', CallToAction);
registerAstroComponent('steps', Steps);
registerAstroComponent('faqs', FAQs);
registerAstroComponent('testimonials', Testimonials);
