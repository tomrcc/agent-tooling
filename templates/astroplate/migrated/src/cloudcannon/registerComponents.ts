import "@cloudcannon/editable-regions/astro-react-renderer";
import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import AnnouncementDisplay from "@/layouts/helpers/AnnouncementDisplay.astro";
import Banner from "@/layouts/partials/Banner.astro";
import Features from "@/layouts/partials/Features.astro";

registerAstroComponent("announcement", AnnouncementDisplay);
registerAstroComponent("banner", Banner);
registerAstroComponent("features", Features);
