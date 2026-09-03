import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loop",
  description: "Premium interactive weekly learning experience",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-dvh w-full bg-surface font-jakarta">
        {children}
      </body>
    </html>
  );
}
