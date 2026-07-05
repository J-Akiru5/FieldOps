import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@syntaxure/ui/styles";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "J.R.R. Air-conditioning and Refrigeration Services | Iloilo",
  description:
    "Air-conditioning, refrigeration, and electronics repair in Iloilo City and Western Visayas. Sales, design, installation, repair, and maintenance.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "J.R.R. Air-conditioning and Refrigeration Services | Iloilo",
    description:
      "Air-conditioning, refrigeration, and electronics repair in Iloilo City and Western Visayas. Sales, design, installation, repair, and maintenance.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "J.R.R. Air-conditioning and Refrigeration Services - Iloilo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
