import "@cloudcannon/editable-regions/astro-react-renderer";
import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import { registerReactComponent } from "@cloudcannon/editable-regions/react";
import { AnnouncementDisplay } from "@/layouts/helpers/Announcement";
import Banner from "@/layouts/partials/Banner.astro";
import Features from "@/layouts/partials/Features.astro";

registerReactComponent("announcement", AnnouncementDisplay);
registerAstroComponent("banner", Banner);
registerAstroComponent("features", Features);
