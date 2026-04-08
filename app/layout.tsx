import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ClerkIdentitySync } from "@/components/providers/ClerkIdentitySync";
import { MSWProvider } from "@/components/providers/MSWProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
  title: "TeamUp - 농구 팀 매칭",
  description: "농구 팀 매칭 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          signInUrl="/login"
          signUpUrl="/signup"
          signInFallbackRedirectUrl="/home"
          signUpFallbackRedirectUrl="/home"
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <MSWProvider>
              <ClerkIdentitySync />
              {children}
              <Toaster />
            </MSWProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
