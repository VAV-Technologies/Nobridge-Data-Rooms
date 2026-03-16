import { Metadata } from "next";

import EmailVerificationClient from "./page-client";

const data = {
  description: "Verify your login to Nobridge",
  title: "Verify Login | Nobridge",
  url: "/auth/email",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nobridge.co"),
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

export default async function EmailVerificationPage() {
  return <EmailVerificationClient />;
}
