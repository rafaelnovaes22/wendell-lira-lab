export const SITE_BASE_PATH = "/wendell-lira-lab";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  `https://rafaelnovaes22.github.io${SITE_BASE_PATH}`;

// Arquivos de public/ precisam do basePath no GitHub Pages. O next/image com
// unoptimized não prefixa, então as imagens usam <img> com este helper.
export function publicPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? SITE_BASE_PATH}${path}`;
}
