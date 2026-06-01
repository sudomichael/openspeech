import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { CompareProvider } from "@/components/CompareProvider";
import CompareBar from "@/components/CompareBar";
import SearchPalette from "@/components/SearchPalette";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenSpeech — Open-source TTS, side-by-side",
  description:
    "Browse open-source text-to-speech models with standardized samples. Every voice reads the same three scripts so you can actually compare them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-fg">
        <CompareProvider>
          {children}
          <CompareBar />
          <SearchPalette />
        </CompareProvider>
        {process.env.NEXT_PUBLIC_GIZMO_KEY && (
          <Script
            src="https://gizmoanalytics.io/script.js"
            data-key={process.env.NEXT_PUBLIC_GIZMO_KEY}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
