import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800", "900"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WENDELL LIRA LAB | Do campo ao controle, EA FC e eFootball",
  description:
    "Método de Wendell Lira, vencedor do Puskás 2015 contra Messi: treino adaptativo de EA FC e eFootball com leitura do futebol real aplicada no virtual.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      "https://wendell-lira-lab-production.up.railway.app",
  ),
  openGraph: {
    title: "WENDELL LIRA LAB",
    description: "Do campo ao controle. Puskás virou método.",
    images: ["/hero-pro-lab.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
