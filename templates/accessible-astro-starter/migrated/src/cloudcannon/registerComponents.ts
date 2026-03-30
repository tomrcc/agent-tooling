import { registerAstroComponent } from '@cloudcannon/editable-regions/astro'
import Hero from '@components/Hero.astro'
import Feature from '@components/Feature.astro'
import Counter from '@components/Counter.astro'
import ContentMedia from '@components/ContentMedia.astro'
import FaqItem from '@components/FaqItem.astro'
import FaqInfo from '@components/FaqInfo.astro'
import CommunityMember from '@components/CommunityMember.astro'

registerAstroComponent('hero', Hero)
registerAstroComponent('feature', Feature)
registerAstroComponent('counter', Counter)
registerAstroComponent('content-media', ContentMedia)
registerAstroComponent('faq-item', FaqItem)
registerAstroComponent('faq-info', FaqInfo)
registerAstroComponent('community-member', CommunityMember)
