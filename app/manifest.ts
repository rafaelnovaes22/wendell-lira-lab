import type { MetadataRoute } from "next";
import { SITE_BASE_PATH } from "@/lib/site-config";

// Rotas de metadata são estáticas no export do GitHub Pages.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WENDELL LIRA LAB",
    short_name: "LIRA LAB",
    description:
      "Método Puskás de Wendell Lira: treino adaptativo de EA FC e eFootball.",
    start_url: `${SITE_BASE_PATH}/`,
    scope: `${SITE_BASE_PATH}/`,
    display: "standalone",
    background_color: "#0a0805",
    theme_color: "#ffd51e",
    icons: [
      {
        src: `${SITE_BASE_PATH}/favicon.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
