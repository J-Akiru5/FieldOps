import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@syntaxure/ui/styles";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Syntaxure FieldOps | Aircon & Electronics Service in the Philippines",
  description:
    "Fast, reliable air conditioning and electronics repair, maintenance, and installation for homes and businesses. Book a service inquiry online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
