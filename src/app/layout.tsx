import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ClerkProvider} from "@clerk/nextjs";
import {Toaster} from "sonner";
import {ThemeProvider} from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linxy",
  description: "The free alternative to link shorteners like Bitly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let allowedOrigins = ["http://localhost:3000"];
  if (process.env.NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS) {
    try {
      allowedOrigins = JSON.parse(process.env.NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS);
    } catch {
      console.warn("Failed to parse NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS, using default");
    }
  }

  return (
        <ClerkProvider allowedRedirectOrigins={allowedOrigins} >
        <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
        {children}
              </ThemeProvider>

      </body>
    </html>
        <Toaster />
    </ClerkProvider>
  );
}
