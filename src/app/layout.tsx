import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "SVG Animator",
  description: "AI-powered node-based SVG animator using Gemini Pro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
