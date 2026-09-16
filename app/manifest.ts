import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WENDELL LIRA LAB",
    short_name: "LIRA LAB",
    description: "Método Puskás de Wendell Lira: treino adaptativo de EA FC e eFootball.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0805",
    theme_color: "#ffd51e",
  };
}
