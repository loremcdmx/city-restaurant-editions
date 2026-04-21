import type { Metadata } from "next";
import { Libre_Franklin, Newsreader } from "next/font/google";
import "./globals.css";
import "./editorial-refresh.css";

const premiumSans = Libre_Franklin({
  variable: "--font-premium-sans",
  subsets: ["latin"],
  display: "swap",
});

const editorialSerif = Newsreader({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Top 20 Restaurants - Mexico City",
  description:
    "An editorial ranking of Mexico City restaurants with maps, reviews, menus, and booking signals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${premiumSans.variable} ${editorialSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
