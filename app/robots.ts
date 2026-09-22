import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

// Rotas de metadata são estáticas no export do GitHub Pages.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
