import type { Metadata } from "next";
import { Space_Grotesk, Work_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "./ConvexClientProvider";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marketing Budget Planner | Clover Growth Partners",
  description:
    "Exclusive access portal for Clover Growth clients. Plan, allocate, and track your marketing spend across every channel — all in one place.",
  metadataBase: new URL("https://planner.growwithclover.com"),
  openGraph: {
    title: "Marketing Budget Planner | Clover Growth Partners",
    description:
      "Exclusive access portal for Clover Growth clients. Plan, allocate, and track your marketing spend across every channel — all in one place.",
    url: "https://planner.growwithclover.com",
    siteName: "Clover Growth Partners",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clover Growth Partners – Marketing Budget Planner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketing Budget Planner | Clover Growth Partners",
    description:
      "Exclusive access portal for Clover Growth clients. Plan, allocate, and track your marketing spend across every channel — all in one place.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${workSans.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-body bg-surface text-on-surface">
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
