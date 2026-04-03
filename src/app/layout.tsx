import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers/providers";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Skunect — School Management & Parent Engagement",
    template: "%s | Skunect",
  },
  description:
    "Real-time attendance, grades, messaging, and payments — one platform built for African schools. Stay connected to your child's education.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Skunect — School Management & Parent Engagement",
    description:
      "Real-time attendance, grades, messaging, and payments — one platform built for African schools.",
    url: "https://skunect.com",
    siteName: "Skunect",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skunect",
    description:
      "Real-time attendance, grades, messaging, and payments — one platform built for African schools.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Skunect",
              description: "School Management & Parent Engagement Platform",
              url: "https://skunect.com",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Skunect",
              url: "https://skunect.com",
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_ENABLED === 'true' && (
          <>
            <script
              async
              src="https://plausible.io/js/pa-ZlMC0edwTcNKk_2XBHjml.js"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${dmSerif.variable} ${jakarta.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
