import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import Hero from "@/components/hero.astro";
import Features from "@/components/features.astro";
import Cta from "@/components/cta.astro";
import PricingCard from "@/components/pricing.astro";

registerAstroComponent("hero", Hero);
registerAstroComponent("features", Features);
registerAstroComponent("cta", Cta);
registerAstroComponent("pricing-card", PricingCard);
