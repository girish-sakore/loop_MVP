import type { Metadata } from "next";
import { abril, dmSans } from "@/lib/fonts";
import { themeInitScript } from "@/lib/matchbox/palettes";
import { PendingCompletionRecovery } from "@/components/gameplay/pending-completion-recovery";
import "./globals.css";
import "./matchbox.css";

export const metadata: Metadata = {
  title: "Loop",
  description: "Premium interactive weekly learning experience",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${abril.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        {/* applies the saved matchbox theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body className="min-h-dvh w-full bg-surface font-jakarta">
        <PendingCompletionRecovery />
        {children}
      </body>
    </html>
  );
}
