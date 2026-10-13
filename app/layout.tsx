import type { Metadata } from "next";
import { Poppins, Open_Sans, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const fontDisplay = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontBody = Open_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kenertec",
  description: "Enterprise Asset Management System",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontBody.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const colorMatch = document.cookie.match(/(?:^|; )theme_color=([^;]*)/);
                const color = colorMatch ? decodeURIComponent(colorMatch[1]) : 'zinc';
                document.documentElement.setAttribute('data-theme-color', color);
                const radiusMatch = document.cookie.match(/(?:^|; )theme_radius=([^;]*)/);
                if (radiusMatch) {
                  document.documentElement.style.setProperty('--radius', decodeURIComponent(radiusMatch[1]) + 'rem');
                }
                const modeMatch = document.cookie.match(/(?:^|; )theme_mode=([^;]*)/);
                if (modeMatch) {
                  const mode = decodeURIComponent(modeMatch[1]);
                  try { localStorage.setItem('theme', mode); } catch (_) {}
                  if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else if (mode === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <MotionConfig reducedMotion="user">
              {children}
            </MotionConfig>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
