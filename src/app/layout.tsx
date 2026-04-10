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

        {/* Meta (Facebook) Pixel — fires PageView on every page, and a custom
            `Lead` event on successful beta signup (wired up in
            beta-signup-form.tsx). Only loads if NEXT_PUBLIC_META_PIXEL_ID is set. */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
fbq('track', 'PageView');
                `,
              }}
            />
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1" />`,
              }}
            />
          </>
        )}

        {/* LinkedIn Insight Tag — fires on every page, and a conversion event
            on successful beta signup (wired up in beta-signup-form.tsx). Only
            loads if NEXT_PUBLIC_LINKEDIN_PARTNER_ID is set. */}
        {process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
_linkedin_partner_id = "${process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);
                `,
              }}
            />
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID}&fmt=gif" />`,
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
