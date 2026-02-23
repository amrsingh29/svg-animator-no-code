import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
