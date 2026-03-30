import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skunect",
  description: "School Management & Parent Engagement Platform",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: 'Skunect',
    description: 'School Management & Parent Engagement Platform',
    url: 'https://skunect.com',
    siteName: 'Skunect',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skunect',
    description: 'School Management & Parent Engagement Platform',
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
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Skunect',
              description: 'School Management & Parent Engagement Platform',
              url: 'https://skunect.com',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Skunect',
              url: 'https://skunect.com',
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
