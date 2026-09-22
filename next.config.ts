import type { NextConfig } from "next";
import { SITE_BASE_PATH } from "./lib/site-config";

const nextConfig: NextConfig = {
  // Site estático no GitHub Pages: sem servidor, progresso em localStorage.
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? SITE_BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
