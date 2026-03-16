import { Metadata } from "next";

import RegisterClient from "./page-client";

const data = {
  description: "Signup to Nobridge",
  title: "Sign up | Nobridge",
  url: "/register",
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

export default function RegisterPage() {
  return <RegisterClient />;
}
