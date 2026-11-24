import type { Metadata } from "next";
import "./globals.css";
import { GridBackground } from "@/components/ui/GridBackground";
import { Header } from "@/components/Header";
import { MenuOverlay } from "@/components/MenuOverlay";
import { ClientDitherWrapper } from "@/components/ClientDitherWrapper";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import fs from "fs";
import path from "path";
import { BriefBuilder } from "@/components/BriefBuilder";
import { Freebie } from "@/components/Freebie";
import { curate } from "@/lib/curation";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://ishan.vryks.com"),
  title: {
    default: "Ishan Mitra | Digital Designer & 3D Visual Artist",
    template: "%s | Ishan Mitra",
  },
  description:
    "Multidisciplinary visual designer blending brand identity, performance creative, and 3D visual storytelling to build high-converting digital experiences.",
  keywords: [
    "Ishan Mitra",
    "Digital Designer",
    "Brand Identity",
    "3D Spatial UI",
    "Performance Creative",
    "Art Direction",
    "Graphic Design Portfolio",
  ],
  authors: [{ name: "Ishan Mitra", url: "https://ishan.vryks.com" }],
  creator: "Ishan Mitra",
  publisher: "Ishan Mitra",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ishan Mitra | Digital Designer & 3D Visual Artist",
    description:
      "Multidisciplinary visual designer blending brand identity, performance creative, and 3D visual storytelling to build high-converting digital experiences.",
    url: "https://ishan.vryks.com",
    siteName: "Ishan Mitra Portfolio",
    images: [
      {
        url: "/about/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "Ishan Mitra Portfolio Hero Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ishan Mitra | Digital Designer & 3D Visual Artist",
    description:
      "Multidisciplinary visual designer blending brand identity, performance creative, and 3D visual storytelling to build high-converting digital experiences.",
    images: ["/about/hero-bg.png"],
    creator: "@ishan575",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://ishan.vryks.com/#person",
      name: "Ishan Mitra",
      jobTitle: "Digital Designer & 3D Visual Artist",
      url: "https://ishan.vryks.com",
      image: "https://ishan.vryks.com/about/ishan-cutout.png",
      sameAs: [
        "https://x.com/ishan575?s=11",
        "https://www.instagram.com/1shaaann.n?stkn=OTNyMTRhdWVxdjRo",
        "https://www.behance.net/isshhaaannn",
        "https://www.linkedin.com/in/ishan-mitra-279385272",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://ishan.vryks.com/#website",
      url: "https://ishan.vryks.com",
      name: "Ishan Mitra Portfolio",
      description: "Graphic design, brand identity, and 3D spatial experiences.",
      publisher: {
        "@id": "https://ishan.vryks.com/#person",
      },
    },
  ],
};

function freebieImages(): string[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "portfolio_db.json"), "utf-8");
    return curate(JSON.parse(raw)).freebies;
  } catch {
    return [];
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-clip">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-full focus:font-medium focus:shadow-2xl focus:outline-none"
        >
          Skip to content
        </a>
        <ClientDitherWrapper>
          <GridBackground />
          <BriefBuilder />
          <Freebie images={freebieImages()} />
          <MenuOverlay />
          <Header />
          {children}
        </ClientDitherWrapper>
      </body>
    </html>
  );
}
