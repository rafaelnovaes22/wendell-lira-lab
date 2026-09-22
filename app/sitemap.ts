import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

// Rotas de metadata são estáticas no export do GitHub Pages.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
