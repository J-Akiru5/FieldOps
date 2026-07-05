import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@syntaxure/ui/styles";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Syntaxure FieldOps Dashboard",
  description: "Internal dashboard for Syntaxure FieldOps",
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
