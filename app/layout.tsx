import { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

const data = {
  description:
    "Nobridge Data Rooms — Secure M&A deal document sharing. Share CIMs, financials, teasers, and NDAs with real-time analytics and granular access controls.",
  title: "Nobridge Data Rooms | Secure Document Sharing for M&A",
  url: "/",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://room.nobridge.co"),
  title: data.title,
  description: data.description,
  openGraph: {
    title: data.title,
    description: data.description,
    url: data.url,
    siteName: "Nobridge",
    images: [
      {
        url: "/_static/meta-image.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: data.title,
    description: data.description,
    creator: "@nobridgeio",
    images: ["/_static/meta-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
