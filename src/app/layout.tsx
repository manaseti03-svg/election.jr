import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Election.jr | AI-Powered Civic Intelligence 🇮🇳",
  description: "Next-gen civic education platform with real-time demographic insights and policy analysis.",
  keywords: ["Election", "India", "Civic Tech", "Gemini AI", "Voter Education"],
  authors: [{ name: "Eti Muni Manas" }],
  openGraph: {
    title: "Election.jr | AI-Powered Civic Intelligence",
    description: "Demographically aware civic education platform built for the PromptWars challenge.",
    url: "https://election-jr-158139253158.asia-south1.run.app/",
    siteName: "Election.jr",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Election.jr | AI-Powered Civic Intelligence",
    description: "Demographically aware civic education platform built for the PromptWars challenge.",
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🗳️</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth selection:bg-blue-500/20`}
      >
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
        >
          Skip to main content
        </a>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
