import type { Metadata } from "next";
import { JetBrains_Mono, Anek_Gujarati } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["300", "400", "500", "600", "700"],
});

const anekGujarati = Anek_Gujarati({
  subsets: ["latin"],
  variable: "--font-anek",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Notes of Tomorrow — Don't Just Read A Book. Chat With It.",
  description:
    "Transform passive reading into active life application. Upload your book highlights and have AI-powered conversations that apply the ideas directly to your current life situations.",
  keywords: ["reading", "books", "AI", "highlights", "Kindle", "notes", "learning"],
  openGraph: {
    title: "Notes of Tomorrow",
    description: "Don't Just Read A Book. Chat With It.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${anekGujarati.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
