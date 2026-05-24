import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { Navbar } from "@/components/layout/Navbar";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: "GrantAI — AI-Powered Grant Discovery & Writing",
    template: "%s | GrantAI",
  },
  description:
    "Find, match, and win grants faster with AI. GrantAI analyzes thousands of funding opportunities and writes compelling applications tailored to your organization.",
  keywords: [
    "grant writing",
    "grant discovery",
    "AI grant assistant",
    "nonprofit funding",
    "research grants",
    "funding opportunities",
  ],
  authors: [{ name: "GrantAI" }],
  creator: "GrantAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://grantai.app",
    title: "GrantAI — AI-Powered Grant Discovery & Writing",
    description:
      "Find, match, and win grants faster with AI. GrantAI analyzes thousands of funding opportunities and writes compelling applications tailored to your organization.",
    siteName: "GrantAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrantAI — AI-Powered Grant Discovery & Writing",
    description:
      "Find, match, and win grants faster with AI.",
    creator: "@grantai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#080810",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <head>
        {/* Preload Fontshare fonts — Clash Display & Satoshi */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="preload"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap"
          as="style"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
          as="style"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${fontVariables} antialiased`}
        style={{
          // Ensure CSS vars are set immediately (no FOUC)
          backgroundColor: "var(--bg-obsidian)",
          color: "var(--color-text)",
        }}
      >
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-primary)] focus:text-white focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>

        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {/* Guided Demo Mode Alert Banner */}
            <DemoBanner />

            {/* Global navigation */}
            <Navbar />

            {/* Page content */}
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
